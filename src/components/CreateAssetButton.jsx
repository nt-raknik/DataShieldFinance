import { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Snackbar, Alert, CircularProgress, Tooltip
} from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

const TYPES = ["stock", "bond", "cash", "etf", "crypto", "fund"];

export default function CreateAssetButton({ onCreated, buttonProps }) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState("stock");
  const [currency, setCurrency] = useState("USD");
  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const submit = async (e) => {
    e.preventDefault();
    const s = symbol.trim();
    const t = assetType.trim();
    const c = currency.trim().toUpperCase();

    const errs = {};
    if (!s) errs.symbol = "Symbol is required";
    if (!t) errs.asset_type = "Type is required";
    if (!c) errs.currency = "Currency is required";
    setFieldErr(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: s, asset_type: t, currency: c }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.error || `HTTP ${res.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }
      setToast({ open: true, msg: "Asset created", severity: "success" });
      onCreated?.(data);
      setOpen(false);
      setSymbol(""); setAssetType("stock"); setCurrency("USD"); setFieldErr({});
    } catch (e) {
      setToast({ open: true, msg: e.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Create asset">
        <span>
        <Button
        {...buttonProps}
        onClick={() => setOpen(true)}
        >
        {buttonProps?.children ?? <CreateNewFolderIcon />}
        </Button>

        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create asset</DialogTitle>
        <form onSubmit={submit}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                error={Boolean(fieldErr.symbol)}
                helperText={fieldErr.symbol || " "}
                autoFocus
              />
              <TextField
                select
                label="Type"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                error={Boolean(fieldErr.asset_type)}
                helperText={fieldErr.asset_type || " "}
              >
                {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                error={Boolean(fieldErr.currency)}
                helperText={fieldErr.currency || " "}
                inputProps={{ maxLength: 6 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Create"}
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
