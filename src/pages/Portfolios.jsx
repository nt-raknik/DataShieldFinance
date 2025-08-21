import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable'
import { DUMMY } from '../services/dummy'
import StocksSidebar from '../components/StocksSidebar'
import { useEffect, useMemo, useState, useRef } from 'react'
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

export default function Portfolios() {

  // Responsive helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Portfolios state
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // Dynamic title
  const selectedPortfolio = portfolios.find((p) => p.portfolio_id === selected);
  const portfolioTitle = selectedPortfolio?.name || "My Portfolio";

  const chartRef2 = useRef(null);
  const chartInstanceRef2 = useRef(null);

  // Dummy chart data (placeholder)
  const rows = DUMMY.holdingsByPortfolio[selected] ?? [];
  const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0);
      return m;
    }, {});
    return Object.entries(byType).map(([label, value]) => ({ label, value }));
  }, [rows]);

  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error creating portfolio: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
      fetchPortfolios();
    }
  };

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


  const handleDelete = async (portfolioId) => {
  if (!portfolioId) return;
  
  try {
    console.log(`Attempting to delete portfolio ${portfolioId}`);
    
    // Use absolute URL with port 4000
      const res = await fetch(`/api/portfolios/user/2/portfolio/${portfolioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) throw new Error(`API ${res.status}`);
    
    setToast({ 
      open: true, 
      msg: "Portfolio deleted successfully", 
      severity: "success" 
    });
    
    if (selected === portfolioId) {
      setSelected(null);
    }
    
    await fetchPortfolios();
  } catch (err) {
    console.error("Delete error:", err);
    setToast({ 
      open: true, 
      msg: `Error deleting portfolio: ${err.message}`, 
      severity: "error" 
    });
  }
};

  // Initial load
  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Flowbite Chart.js integration with real-time emulation
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    // Only run if window.Chart is available (Flowbite + Chart.js loaded globally)
    if (window.Chart && chartRef.current) {
      // Destroy previous chart instance if exists
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy()
      }
      chartRef.current.chartInstance = new window.Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: series.map(s => s.label),
          datasets: [{
            label: 'Holdings',
            data: series.map(s => s.value),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(251, 191, 36, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(239, 68, 68, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    // Real-time emulation: update chart data every 2 seconds
      const interval = setInterval(() => {
        if (chartInstanceRef.current) {
          // Generate random data for demo purposes
          chartInstanceRef.current.data.datasets[0].data = chartInstanceRef.current.data.datasets[0].data.map(
            () => Math.floor(Math.random() * 100) + 1
          )
          chartInstanceRef.current.update()
        }
      }, 2000)

      // Cleanup
      return () => {
        clearInterval(interval)
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy()
        }
      }
    }
  }, [series])

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
              className={`px-3 py-1 rounded-full border ${
                selected === p.portfolio_id ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
              data-portfolio-id={p.portfolio_id}  // Add data attribute for portfolio ID
            >
              {p.name}
            </button>
          </Grid>
        ))}
        
        {/* Add a divider */}
        <Grid item>
          <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 1 }} />
        </Grid>
        
        {/* Add and Delete buttons */}
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

    {/* ===== MAIN LAYOUT: 2 columns; right card spans full height ===== */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",      // stacked on mobile
              md: "5fr 7fr",  // 70/30 split on md+
            },
            // two rows on md+: row 1 = Portfolio, row 2 = Stocks.
            gridTemplateRows: {
              xs: "auto",
              md: "auto auto",
            },
            alignItems: "stretch",
          }}
        >
          {/* LEFT-TOP: Portfolio card */}
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
              {/* Header: clamped title + actions */}
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
                      whiteSpace: { xs: "normal", md: "nowrap" }, // wrap on mobile, ellipsis on desktop
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {portfolioTitle}
                  </Typography>
                </Tooltip>
                <Box/>

                
              
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>                  
                  <CreateAssetButton
                    onCreated={() => setToast({ open: true, msg: "Asset created", severity: "success" })}
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
                      children: <CreateNewFolderIcon fontSize={isMobile ? "small" : "medium"} />,
                    }}
                  />
                  <DeleteAssetButton
                    portfolioId={selected}
                    onDeleted={() => setToast({ open: true, msg: "Asset deleted", severity: "success" })}
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
                      children: <FolderDeleteIcon fontSize={isMobile ? "small" : "medium"} />,
                    }}
                  />
                </Box>                
              </Box>

            <Grid container>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {selected ? (
                      <>
                        {/* Holdings table now appears first */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Current Holdings</Typography>
                        <PortfolioHoldings portfolioId={selected} />
                        
                        {/* Transaction History now appears second */}
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

          {/* RIGHT: Chart — spans both rows on md+ and fills remaining height */}
          <Box
            sx={{
              gridColumn: { xs: "1", md: "2" },
              gridRow: { xs: "auto", md: "1 / span 2" },
              minWidth: 0,
              overflow: "hidden",
            }}
          >
          {/* RIGHT COLUMN: two charts, each fills 50% of the column height */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" }, // ⬅️ equal split on md+
              minHeight: 0, // allow children to size correctly
            }}
          >
            {/* Chart 1 */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Portfolio Allocation</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 0 }}>
                <canvas ref={chartRef} style={{ position: "absolute", inset: 0 }} />
              </Box>
            </Card>

            {/* Chart 2 */}
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Box sx={{ pb: 1, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 600 }}>Holdings Breakdown</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, position: "relative", minHeight: 0 }}>
                <canvas ref={chartRef2} style={{ position: "absolute", inset: 0 }} />
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" }, // ⬅️ equal split on md+
              minHeight: 0, // allow children to size correctly
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
  )
}