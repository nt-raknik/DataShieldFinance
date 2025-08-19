import { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, IconButton, Tooltip, Snackbar, Alert, CircularProgress
} from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

export default function CreatePortfolioButton({ userId = 2, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ open: true, msg: "El nombre es obligatorio", severity: "warning" });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      // opcional: si tu API devuelve algo más, puedes leerlo:
      // const json = await res.json();

      setToast({ open: true, msg: "Portafolio creado", severity: "success" });
      setOpen(false);
      setName("");
      setDescription("");
      onCreated?.(); // avisa al padre para refrescar data si es necesario
    } catch (err) {
      setToast({ open: true, msg: `Error al crear: ${err.message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón con ícono (puedes cambiar a <Button variant="contained">Crear</Button>) */}
      <Tooltip title="Crear portafolio">
        <span>
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <CreateNewFolderIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear portafolio</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
              <TextField
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={2}
              />
              <TextField
                label="User ID"
                type="number"
                value={userId}
                InputProps={{ readOnly: true }}
                helperText="Fijado para demo; puedes hacerlo editable si lo necesitas."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
