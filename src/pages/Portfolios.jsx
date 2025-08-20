import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable'
import { DUMMY } from '../services/dummy'
import StocksSidebar from '../components/StocksSidebar'
import { useEffect, useMemo, useState, useRef } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Snackbar, TextField, Typography } from '@mui/material';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PortfolioHoldings from '../components/PortfolioHoldings.jsx';

import CreatePortfolioButton from "../components/createPortfolioButton";

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

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
    console.log("Refreshing portfolios")
    setToast({ open: true, msg: "Portfolio created successfully", severity: "success" });
    // Refresh portfolios list    
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
      <Grid container>
        <Grid size={4} spacing={2}>
          <Card sx={{p:2, bgcolor: "#00674F", color: "#FFFFFF"}}>
            <Grid container spacing={4} justifyContent="center">
              <Grid sx={{borderColor: "blue", border: '2px solid white', display: "flex"}} size={6} justifyContent="center">
                <Typography sx={{fontWeight: "bold", fontSize: "1.5rem", color: "#BB77FF"}}>My history</Typography>
              </Grid>
              <Grid sx={{borderColor: "blue", border: '2px solid white', display: "flex", justifyContent: 'center'}} size={6}>
                  <Button sx={{color: "white", ':hover': {bgcolor: 'blue', color: 'white'}}}>
                    <CreateNewFolderIcon />
                  </Button>
                  <Button sx={{color: "red", ':hover': {bgcolor: 'red', color: 'white'}}}>
                    <FolderDeleteIcon/>
                  </Button>    
              </Grid>
              <Grid container>
              <Grid item xs={12}>
                <Card>
                  {/* <CardContent>
                    {selected ? (
                      <PortfolioTable portfolioId={selected} />
                    ) : (
                      <Typography sx={{ p: 2, textAlign: 'center' }}>
                        Select a portfolio to view the transactions
                      </Typography>
                    )}
                  </CardContent> */}
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
            </Grid>
          </Card>
        </Grid>        
        <Grid size={4}>
          <Card title="Graph (dummy)">
            <div className="mt-6 bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <canvas ref={chartRef} className="w-full max-w-xs" />
            </div>
          </Card>          
        </Grid>
        <Grid size={4}>        
          <StocksSidebar />
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
  )
}