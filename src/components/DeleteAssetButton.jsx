import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Typography, Snackbar, Alert, CircularProgress, Tooltip
} from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";

export default function DeleteAssetButton({ portfolioId, onDeleted, buttonProps }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const disabled = !portfolioId;

  useEffect(() => {
    if (!open || !portfolioId) return;
    (async () => {
      try {
        const res = await fetch(`/api/assets/${portfolioId}`);
        const data = await res.json().catch(() => []);
        setAssets(Array.isArray(data) ? data : []);
      } catch {
        setAssets([]);
      }
    })();
  }, [open, portfolioId]);

  useEffect(() => { setAssetId(""); }, [portfolioId]);

  const submit = async (e) => {
    e.preventDefault();
    const id = Number(assetId);
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || data.error || `HTTP ${res.status}`;
        setToast({ open: true, msg, severity: "error" });
        return;
      }
      setToast({ open: true, msg: "Asset deleted", severity: "success" });
      onDeleted?.(id);
      setOpen(false);
      setAssetId("");
    } catch (e2) {
      setToast({ open: true, msg: e2.message || "Unexpected error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title={disabled ? "Select a portfolio first" : "Delete asset"}>
        <span>
        <Button
            {...buttonProps}
            onClick={() => !disabled && setOpen(true)}
            disabled={disabled}
            >
            {buttonProps?.children ?? <FolderDeleteIcon />}
            </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete asset</DialogTitle>
        <form onSubmit={submit}>
          <DialogContent>
            {assets.length === 0 ? (
              <Typography variant="body2">No assets found in this portfolio.</Typography>
            ) : (
              <TextField
                select
                label="Select asset"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                fullWidth
                helperText="Only assets from the selected portfolio are listed."
              >
                {assets.map(a => (
                  <MenuItem key={a.asset_id} value={a.asset_id}>
                    {a.symbol} — {a.asset_type} ({a.currency})  #{a.asset_id}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" color="error" variant="contained" disabled={!assetId || loading}>
              {loading ? <CircularProgress size={22} /> : "Delete"}
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
