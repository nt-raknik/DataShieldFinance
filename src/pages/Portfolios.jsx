import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable';
import StocksSidebar from '../components/StocksSidebar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, Grid, Snackbar, Typography } from '@mui/material';
import Tooltip from "@mui/material/Tooltip";
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PortfolioHoldings from '../components/PortfolioHoldings.jsx';
import CreateAssetButton from "../components/CreateAssetButton";
import DeleteAssetButton from "../components/DeleteAssetButton";
import CreatePortfolioButton from "../components/createPortfolioButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Charts
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

export default function Portfolios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // ===== PERFORMANCE (línea) =====
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Paleta viva para líneas
  const lineColors = {
    pnl: {
      border: '#FF6B6B',            // rojo coral
      background: 'rgba(255,107,107,0.2)',
    },
    mv: {
      border: '#4ECDC4',            // turquesa
      background: 'rgba(78,205,196,0.2)',
    }
  };

  const performanceOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Portfolio Performance (P&L and Market Value)' },
      legend: { position: 'bottom' }
    },
    interaction: { intersect: false, mode: 'index' },
    maintainAspectRatio: false
  };

  const fetchPerformanceData = async (portfolioId) => {
    setLoadingGraph(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/performance`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const chartData = {
        labels: (data.history ?? []).map((e) => e.date),
        datasets: [
          {
            label: 'P&L',
            data: (data.history ?? []).map((e) => e.pnl),
            borderColor: lineColors.pnl.border,
            backgroundColor: lineColors.pnl.background,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Market Value',
            data: (data.history ?? []).map((e) => e.marketValue),
            borderColor: lineColors.mv.border,
            backgroundColor: lineColors.mv.background,
            fill: true,
            tension: 0.4,
          }
        ]
      };
      setPerformanceData(chartData);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setPerformanceData(null);
    } finally {
      setLoadingGraph(false);
    }
  };

  // ===== HOLDINGS (doughnut por valor) =====
  // Guardamos los objetos completos para reutilizar propiedades cuando quieras
  const [holdingsWB, setHoldingsWB] = useState([]); // [{ asset_id, symbol, name, quantity, price_usd, value_usd, weight, ... }]
  const [totalWB, setTotalWB] = useState(0);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  const fetchHoldingsValueBreakdown = async (portfolioId) => {
    setLoadingHoldings(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings/value-breakdown`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setHoldingsWB(Array.isArray(data.holdings) ? data.holdings : []);
      setTotalWB(Number(data.total_value_usd || 0));
    } catch (err) {
      console.error("Error fetching value-breakdown:", err);
      setHoldingsWB([]);
      setTotalWB(0);
    } finally {
      setLoadingHoldings(false);
    }
  };

  // Serie para el chart (sin perder el objeto original)
  const doughnutSeries = useMemo(() => {
    return (holdingsWB ?? []).map(h => ({
      label: h.symbol ?? h.name,
      value: Number(h.value_usd || 0),
      _raw: h
    }));
  }, [holdingsWB]);

  // Paleta viva para la dona
  const vividColors = [
    '#FF6B6B', // rojo coral
    '#4ECDC4', // turquesa
    '#FFD93D', // amarillo brillante
    '#6A4C93', // púrpura
    '#1A936F', // verde esmeralda
    '#FF922B', // naranja fuerte
    '#1982C4', // azul vivo
    '#C1121F', // rojo intenso
    '#00B8D4', // cian
    '#C0CA33', // lima
  ];

  const doughnutData = useMemo(() => ({
    labels: doughnutSeries.map(s => s.label),
    datasets: [{
      label: 'Weight (%)',
      data: doughnutSeries.map(s => s.value),
      backgroundColor: doughnutSeries.map((_, i) => vividColors[i % vividColors.length]),
      borderWidth: 2,
      borderColor: "#ffffff", // borde blanco para contraste
    }]
  }), [doughnutSeries]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left',                 // ⬅️ leyenda a la izquierda
        labels: { usePointStyle: true, padding: 16 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed;
            const pct = totalWB ? ((val / totalWB) * 100).toFixed(2) : "0.00";
            return `${ctx.label}: $${Number(val).toLocaleString()} (${pct}%)`;
          }
        }
      }
    }
  }), [totalWB]);

  // ===== API: Portfolios & acciones =====
  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolios/user/2");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setPortfolios(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error creating portfolio: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      fetchPortfolios();
    }
  };

  const handleDelete = async (portfolioId) => {
    if (!portfolioId) return;
    try {
      const res = await fetch(`/api/portfolios/user/2/portfolio/${portfolioId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setToast({ open: true, msg: "Portfolio deleted successfully", severity: "success" });
      if (selected === portfolioId) setSelected(null);
      await fetchPortfolios();
    } catch (err) {
      setToast({ open: true, msg: `Error deleting portfolio: ${err.message}`, severity: "error" });
    }
  };

  // Initial load
  useEffect(() => { fetchPortfolios(); }, []);

  // On portfolio change, cargar performance + breakdown por valor
  useEffect(() => {
    if (selected) {
      fetchPerformanceData(selected);
      fetchHoldingsValueBreakdown(selected);
    } else {
      setPerformanceData(null);
      setHoldingsWB([]);
      setTotalWB(0);
    }
  }, [selected]);

  const portfolioTitle = (portfolios.find(p => p.portfolio_id === selected)?.name) || "My Portfolio";

  return (
    <Container disableGutters>
      {loading ? (
        <Grid container justifyContent="center" spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3].map((n) => (
            <Grid item key={n}>
              <Box className="px-3 py-1 rounded-full border bg-neutral-100 animate-pulse" sx={{ width: 100 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {portfolios.map((p) => (
            <Grid item key={p.portfolio_id}>
              <button
                onClick={() => setSelected(p.portfolio_id)}
                className={`px-3 py-1 rounded-full border ${selected === p.portfolio_id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
                data-portfolio-id={p.portfolio_id}
              >
                {p.name}
              </button>
            </Grid>
          ))}

          {/* Divider */}
          <Grid item>
            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 1 }} />
          </Grid>

          {/* Create / Delete */}
          <Grid item>
            <CreatePortfolioButton userId={2} onCreated={handleCreated} />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FolderDeleteIcon />}
              sx={{
                bgcolor: "#FA2323",
                ":hover": { bgcolor: "#CD0404" },
                transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
                transform: "translateZ(0)",
                willChange: "transform",
                "&:hover": { transform: "translateY(-1px)" },
                "&:active": { transform: "translateY(0px) scale(0.98)" }
              }}
              disabled={!selected}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this portfolio?')) {
                  handleDelete(selected);
                }
              }}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
          gridTemplateRows: { xs: "auto", md: "auto auto" },
          alignItems: "stretch",
        }}
      >
        {/* LEFT-TOP: Portfolio card — SIN CAMBIOS */}
        <Box sx={{ minWidth: 0, overflow: "hidden", gridColumn: "1", gridRow: { xs: "auto", md: "1" } }}>
          <Card
            sx={{
              p: 2,
              bgcolor: "#00674F",
              color: "#FFFFFF",
              minHeight: 280,
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                pb: 1.5,
                borderBottom: "1px dashed rgba(255,255,255,0.25)",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <Tooltip title={portfolioTitle}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
                    color: "#BB77FF",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                    lineHeight: 1.2,
                    flexGrow: 1,
                    minWidth: 0,
                    whiteSpace: { xs: "normal", md: "nowrap" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {portfolioTitle}
                </Typography>
              </Tooltip>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <CreateAssetButton
                portfolioId={selected}
                onCreated={() => {
                  setToast({ open: true, msg: "Compra registrada", severity: "success" });
                  // refresca holdings/tabla si quieres:
                  // fetchHoldingsValueBreakdown(selected);
                  // (y si tu PortfolioHoldings/PortfolioTable dependen de API, se actualizarán solos o puedes forzarlo)
                }}
                buttonProps={{
                  variant: "text",
                  size: isMobile ? "small" : "medium",
                  sx: {
                    color: "white",
                    ":hover": { bgcolor: "blue", color: "white" },
                    transition: "transform 120ms ease, background-color 120ms ease",
                    transform: "translateZ(0)",
                    willChange: "transform",
                    "&:hover": { transform: "translateY(-1px)" },
                    "&:active": { transform: "translateY(0px) scale(0.98)" },
                  },
                }}
              >
                <CreateNewFolderIcon fontSize={isMobile ? "small" : "medium"} />
              </CreateAssetButton>

              <DeleteAssetButton
                portfolioId={selected}
                onDeleted={() => setToast({ open: true, msg: "Asset sold", severity: "success" })}
                buttonProps={{
                  variant: "text",
                  size: isMobile ? "small" : "medium",
                  sx: {
                    color: "red",
                    ":hover": { bgcolor: "red", color: "white" },
                    transition: "transform 120ms ease, background-color 120ms ease",
                    transform: "translateZ(0)",
                    willChange: "transform",
                    "&:hover": { transform: "translateY(-1px)" },
                    "&:active": { transform: "translateY(0px) scale(0.98)" },
                  },
                }}
              >
                <FolderDeleteIcon fontSize={isMobile ? "small" : "medium"} />
              </DeleteAssetButton>

              </Box>
            </Box>

            {/* Holdings + Transactions */}
            <Grid container>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {selected ? (
                      <>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Current Holdings</Typography>
                        <PortfolioHoldings portfolioId={selected} />

                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Transaction History</Typography>
                          <PortfolioTable portfolioId={selected} />
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ p: 2, textAlign: 'center' }}>
                        Select a portfolio to view the holdings and transactions
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* RIGHT: Charts column (2 charts 50/50) */}
        <Box
          sx={{
            gridColumn: { xs: "1", md: "2" },
            gridRow: { xs: "auto", md: "1 / span 2" },
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" },
              minHeight: 0,
            }}
          >
            {/* Chart 1: Portfolio Performance (línea) */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Portfolio Performance</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 260 }}>
                {selected ? (
                  loadingGraph ? (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography>Loading performance…</Typography>
                    </Box>
                  ) : performanceData ? (
                    <Box sx={{ position: "absolute", inset: 0, p: 1 }}>
                      <Line data={performanceData} options={performanceOptions} />
                    </Box>
                  ) : (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                      <Typography variant="body2">
                        No performance data from <code>/api/portfolios/{selected}/performance</code>.
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>Select a portfolio to view performance</Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Chart 2: Holdings Breakdown (Doughnut por valor) */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Holdings Breakdown</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 260 }}>
                {loadingHoldings ? (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>Loading holdings…</Typography>
                  </Box>
                ) : doughnutSeries.length ? (
                  <Box sx={{ position: "absolute", inset: 0, p: 1 }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </Box>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography>No holdings to display</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" },
              minHeight: 0,
            }}
          >
            {/* LEFT-BOTTOM: Stocks card */}
            <Box sx={{ gridColumn: "1", gridRow: { xs: "auto", md: "2" }, minWidth: 0 }}>
              <StocksSidebar />
            </Box>
          </Grid>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
