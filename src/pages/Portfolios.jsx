import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  Snackbar,
  Alert,
} from "@mui/material";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";

import PortfolioTable from "../components/PortfolioTable";
import DonutChart from "../components/DonutChart";
import StocksSidebar from "../components/StocksSidebar";
import CreatePortfolioButton from "../components/createPortfolioButton";
import { DUMMY } from "../services/dummy";

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

  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const handleCreated = (res) => {
    if (res?.message) {
      setToast({ open: true, msg: res.message, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      // TODO: trigger refetch when API listing is connected
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      {/* Dummy portfolio selector */}
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
        {/* Left column: table card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 4, pl: 2, pb: 2, bgcolor: "#00674F", color: "#FFFFFF" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                My portfolio
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {/* Create portfolio — same look as before */}
                  <CreatePortfolioButton userId={2} onCreated={handleCreated} />

                  {/* Delete placeholder */}
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

        {/* Center column: donut */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Box fontWeight={600} mb={1}>
              Graph (dummy)
            </Box>
            <DonutChart series={series} />
          </Card>
        </Grid>

        {/* Right column: stocks sidebar (dummy) */}
        <Grid item xs={12} md={4}>
          <StocksSidebar />
        </Grid>
      </Grid>

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
