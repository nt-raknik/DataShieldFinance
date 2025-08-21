import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress,
  Tooltip, InputLabel, Select, FormControl
} from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

const TYPES = ["stock","bond","crypto","fund","cash"]; // coincide con tu ENUM

export default function CreateAssetButton({ onCreated, buttonProps, portfolioId, children }) {
  const [open, setOpen] = useState(false);

  // filtro y catálogo
  const [assetType, setAssetType] = useState("stock");
  const [assetsList, setAssetsList] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // selección
  const [assetId, setAssetId] = useState("");

  // transacción
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");

  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Cargar catálogo al abrir y cuando cambia el tipo
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAssets(true);
        const res = await fetch(`/api/assets?type=${encodeURIComponent(assetType)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAssetsList(Array.isArray(data) ? data : []);
      } catch {
        setAssetsList([]);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [open, assetType]);

  const resetForm = () => {
    setAssetType("stock");
    setAssetsList([]);
    setAssetId("");
    setDate(new Date().toISOString().slice(0,10));
    setQuantity(""); setPrice(""); setFees(""); setNotes("");
    setFieldErr({});
  };

  const validate = () => {
    const errs = {};
    if (!portfolioId) errs.portfolioId = "Selecciona un portafolio";
    if (!assetId) errs.asset_id = "Selecciona un asset";
    if (!date) errs.date = "Fecha requerida";
    if (!quantity || Number(quantity) <= 0) errs.quantity = "Cantidad > 0";
    if (price === "" || Number(price) < 0) errs.price = "Precio >= 0";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Registrar compra (BUY) en /api/transactions
      const resT = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          asset_id: assetId,
          date,
          type: "buy",
          quantity: Number(quantity),
          price: Number(price),
          fees: fees ? Number(fees) : 0,
          notes: notes || undefined
        }),
      });
      const dataT = await resT.json().catch(() => ({}));
      if (!resT.ok) {
        const msg = dataT.message || dataT.error || `HTTP ${resT.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }

      setToast({ open: true, msg: "Compra registrada", severity: "success" });
      onCreated?.(dataT);
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
      <Tooltip title="Comprar asset existente">
        <span>
          <Button {...buttonProps} onClick={() => setOpen(true)}>
            {/* Conserva tu ícono/children y animación de buttonProps */}
            {children ?? <CreateNewFolderIcon />}
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => !loading && (setOpen(false), resetForm())} fullWidth maxWidth="sm">
        <DialogTitle>Buy existing asset</DialogTitle>
        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {/* Tipo */}
              <TextField
                select
                label="Type"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
              >
                {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>

              {/* Asset existente */}
              <FormControl fullWidth error={Boolean(fieldErr.asset_id)}>
                <InputLabel id="asset-select-label">Asset</InputLabel>
                <Select
                  labelId="asset-select-label"
                  label="Asset"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                >
                  {loadingAssets && <MenuItem disabled>Loading...</MenuItem>}
                  {!loadingAssets && assetsList.length === 0 && <MenuItem disabled>No assets</MenuItem>}
                  {!loadingAssets && assetsList.map(a => (
                    <MenuItem key={a.asset_id} value={a.asset_id}>
                      {a.symbol} — {a.name} [{a.currency}]
                    </MenuItem>
                  ))}
                </Select>
                {!!fieldErr.asset_id && <small style={{color:"#d32f2f"}}>{fieldErr.asset_id}</small>}
              </FormControl>

              {/* Transacción */}
              <TextField
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={Boolean(fieldErr.date)}
                helperText={fieldErr.date || " "}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={Boolean(fieldErr.quantity)}
                helperText={fieldErr.quantity || " "}
                inputProps={{ step: "any", min: "0" }}
              />
              <TextField
                type="number"
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={Boolean(fieldErr.price)}
                helperText={fieldErr.price || " "}
                inputProps={{ step: "any", min: "0" }}
              />
              <TextField
                type="number"
                label="Fees (optional)"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                inputProps={{ step: "any", min: "0" }}
              />
              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
              />

              {!!fieldErr.portfolioId && <Alert severity="error">{fieldErr.portfolioId}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading || !portfolioId}>
              {loading ? <CircularProgress size={22} /> : "Buy"}
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
