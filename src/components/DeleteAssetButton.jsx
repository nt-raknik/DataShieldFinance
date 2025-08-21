import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress,
  Tooltip, InputLabel, Select, FormControl, Box, Typography
} from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";

export default function DeleteAssetButton({ portfolioId, onDeleted, buttonProps, children }) {
  const [open, setOpen] = useState(false);

  // holdings del portafolio (para elegir cuál vender)
  const [holdings, setHoldings] = useState([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  // selección y venta
  const [assetId, setAssetId] = useState("");
  const [maxQty, setMaxQty] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Cargar holdings cuando se abre el modal
  useEffect(() => {
    if (!open || !portfolioId) return;
    (async () => {
      try {
        setLoadingHoldings(true);
        // Usamos tu endpoint existente:
        // GET /api/portfolios/:portfolioId/holdings
        const res = await fetch(`/api/portfolios/${portfolioId}/holdings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHoldings(Array.isArray(data) ? data : []);
      } catch (e) {
        setHoldings([]);
      } finally {
        setLoadingHoldings(false);
      }
    })();
  }, [open, portfolioId]);

  // cuando cambias el asset, ajusta maxQty sugerido
  useEffect(() => {
    if (!assetId) { setMaxQty(0); return; }
    const h = holdings.find(x => x.asset_id === assetId);
    setMaxQty(h ? Number(h.quantity || 0) : 0);
  }, [assetId, holdings]);

  const resetForm = () => {
    setAssetId("");
    setMaxQty(0);
    setQuantity("");
    setPrice("");
    setFieldErr({});
  };

  const validate = () => {
    const errs = {};
    if (!portfolioId) errs.portfolioId = "Selecciona un portafolio";
    if (!assetId) errs.asset_id = "Selecciona un asset";
    const q = Number(quantity);
    if (!(q > 0)) errs.quantity = "Cantidad > 0";
    if (maxQty && q > maxQty) errs.quantity = `No puedes vender más de ${maxQty}`;
    const p = Number(price);
    if (!(p >= 0)) errs.price = "Precio >= 0";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Usamos tu ruta existente que registra una transacción SELL con CURDATE():
      // POST /api/assets/remove  body: { portfolio_id, asset_id, quantity, price }
      const res = await fetch("/api/assets/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: assetId,
          quantity: Number(quantity),
          price: Number(price)
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.error || `HTTP ${res.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }
      setToast({ open: true, msg: "Venta registrada (sell)", severity: "success" });
      onDeleted?.(data);
      setOpen(false);
      resetForm();
    } catch (err) {
      setToast({ open: true, msg: err.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Vender asset">
        <span>
          <Button {...buttonProps} onClick={() => setOpen(true)}>
            {/* Conserva tu icono/children y animación */}
            {children ?? <FolderDeleteIcon />}
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => !loading && (setOpen(false), resetForm())} fullWidth maxWidth="sm">
        <DialogTitle>Sell asset</DialogTitle>
        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {!portfolioId && (
                <Alert severity="warning">Selecciona un portafolio antes de vender.</Alert>
              )}

              {/* Selector de asset desde holdings */}
              <FormControl fullWidth error={Boolean(fieldErr.asset_id)}>
                <InputLabel id="asset-select-label">Asset</InputLabel>
                <Select
                  labelId="asset-select-label"
                  label="Asset"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  disabled={!portfolioId || loadingHoldings}
                >
                  {loadingHoldings && <MenuItem disabled>Loading...</MenuItem>}
                  {!loadingHoldings && holdings.length === 0 && <MenuItem disabled>No holdings</MenuItem>}
                  {!loadingHoldings && holdings.map(h => (
                    <MenuItem key={h.asset_id} value={h.asset_id}>
                      {h.symbol} — {h.name} • Qty: {Number(h.quantity).toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldErr.asset_id && <small style={{ color: "#d32f2f" }}>{fieldErr.asset_id}</small>}
              </FormControl>

              {/* Cantidad y precio */}
              <Box>
                <TextField
                  type="number"
                  label={`Quantity ${maxQty ? `(≤ ${maxQty})` : ""}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  error={Boolean(fieldErr.quantity)}
                  helperText={fieldErr.quantity || " "}
                  inputProps={{ step: "any", min: "0" }}
                  fullWidth
                />
              </Box>

              <TextField
                type="number"
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={Boolean(fieldErr.price)}
                helperText={fieldErr.price || " "}
                inputProps={{ step: "any", min: "0" }}
                fullWidth
              />

              {!!fieldErr.portfolioId && <Alert severity="error">{fieldErr.portfolioId}</Alert>}

              {/* Preview opcional */}
              {quantity && price && (
                <Typography variant="body2" color="text.secondary">
                  Importe aprox.: {(Number(quantity) * Number(price)).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading || !portfolioId}>
              {loading ? <CircularProgress size={22} /> : "Sell"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </>
  );
}
