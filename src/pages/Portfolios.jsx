// src/portfolios.jsx
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

import PortfolioTable from "../components/PortfolioTable";
import DonutChart from "../components/DonutChart";
import StocksSidebar from "../components/StocksSidebar";
import { DUMMY } from "../services/dummy";

// --- Diálogo interno para crear portafolio ---
function CreatePortfolioDialog({ open, onClose, userId = 2, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      // Cambia a 'http://localhost:4000/api/portfolios' si NO usas proxy de Vite.
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
      onCreated?.();
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
      onCreated?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Crear portafolio</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="grid" gap={2}>
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
            <TextField label="User ID" type="number" value={userId} InputProps={{ readOnly: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={!loading && <CreateNewFolderIcon />}>
            {loading ? <CircularProgress size={22} /> : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function Portfolios() {
  const [selected, setSelected] = useState(1);
  const rows = DUMMY.holdingsByPortfolio[selected] ?? [];

  const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0);
      return m;
    }, {});
    return Object.entries(byType).map(([label, value]) => ({ label, value }));
  }, [rows]);

  // UI estado para crear
  const [openCreate, setOpenCreate] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error al crear: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portafolio creado", severity: "success" });
      // TODO: aquí puedes hacer re-fetch de portfolios reales cuando los conectes a la API
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      {/* Selector de portafolios (DUMMY) */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        {DUMMY.portfolios.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`px-3 py-1 rounded-full border ${selected === p.id ? "bg-black text-white" : "hover:bg-neutral-100"}`}
          >
            {p.name}
          </button>
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Columna izquierda: Card principal con tabla */}
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 4, pl: 2, pb: 2, bgcolor: "#00674F", color: "#FFFFFF" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                My portfolio
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {/* Crear portafolio */}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenCreate(true)}
                    startIcon={<CreateNewFolderIcon />}
                    sx={{ bgcolor: "#00A199", ":hover": { bgcolor: "#008B83" } }}
                  >
                    Crear
                  </Button>

                  {/* Borrar (placeholder) */}
                  <Button sx={{ color: "red", ":hover": { bgcolor: "red", color: "white" } }}>
                    <FolderDeleteIcon />
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box mt={2}>
              <PortfolioTable rows={rows} />
            </Box>
          </Card>
        </Grid>

        {/* Columna centro: Donut */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Box fontWeight={600} mb={1}>
              Graph (dummy)
            </Box>
            <DonutChart series={series} />
          </Card>
        </Grid>

        {/* Columna derecha: Stocks dummy */}
        <Grid item xs={12} md={4}>
          <StocksSidebar />
        </Grid>
      </Grid>

      {/* Dialog crear */}
      <CreatePortfolioDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        userId={2}
        onCreated={handleCreated}
      />

      {/* Toast */}
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
    </Container>
  );
}
