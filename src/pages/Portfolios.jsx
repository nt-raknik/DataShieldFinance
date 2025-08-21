import { useState, useEffect, useRef } from 'react';
import { Grid, Card, Typography, CircularProgress, Container, Button, Snackbar, Alert, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { DUMMY } from '../services/dummy';
import PortfolioTable from '../components/PortfolioTable';
import CreatePortfolioButton from "../components/createPortfolioButton";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [performanceData, setPerformanceData] = useState(null); // Store performance data
  const [loadingGraph, setLoadingGraph] = useState(false); // Track loading state for graph
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

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

  const fetchPerformanceData = async (portfolioId) => {
    setLoadingGraph(true); // Set loading state to true
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/performance`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const chartData = {
        labels: data.history.map((entry) => entry.date), // Extract dates for x-axis
        datasets: [
          {
            label: 'P&L',
            data: data.history.map((entry) => entry.pnl), // Use 'pnl' as data for the graph
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Market Value',
            data: data.history.map((entry) => entry.marketValue), // Use 'marketValue' as another dataset
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      };
      setPerformanceData(chartData);
    } catch (err) {
      console.error("Error fetching performance data:", err);
    } finally {
      setLoadingGraph(false); // Set loading state to false
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
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setToast({ open: true, msg: "Portfolio deleted successfully", severity: "success" });
      if (selected === portfolioId) {
        setSelected(null);
      }
      await fetchPortfolios();
    } catch (err) {
      setToast({ open: true, msg: `Error deleting portfolio: ${err.message}`, severity: "error" });
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchPerformanceData(selected); // Fetch performance data when a portfolio is selected
    }
  }, [selected]);

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
          <Grid item>
            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 1 }} />
          </Grid>
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
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <div className="mt-6 bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
              <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#BB77FF" }}>Portfolio Performance</Typography>
              {loadingGraph ? (
                <CircularProgress />
              ) : performanceData ? (
                <div className="w-full max-w-xs">
                  <Line data={performanceData} options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Portfolio Performance (P&L and Market Value)'
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} />
                </div>
              ) : (
                <Typography sx={{ p: 2, textAlign: 'center' }}>No performance data available</Typography>
              )}
            </div>
          </Card>
        </Grid>
      </Grid>
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
