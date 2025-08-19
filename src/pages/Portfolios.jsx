//import Card from '../components/Card'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable'
import DonutChart from '../components/DonutChart'
import { DUMMY } from '../services/dummy'
import StocksSidebar from '../components/StocksSidebar'
import { useEffect, useMemo, useState, useRef } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Snackbar, TextField, Typography } from '@mui/material';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { lightBlue, red } from '@mui/material/colors';
import Assets_req from '../components/Assets_req' // Assuming Assets_req is a component that fetches and displays assets  

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
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  //useEffect(() => {
    //let alive = true;

    /*const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/portfolios/user/2");
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setPortfolios(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Error");
          setLoading(false);
        }
      }
    };*/

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

    /*fetchPortfolios();
    return () => { alive = false; };
  }, []);*/

  // Initial load
  useEffect(() => {
    fetchPortfolios();
  }, []);

   // Update the handleCreated function to refresh portfolios
  const handleCreated = (err) => {
    if (err) {
      setToast({ open: true, msg: `Error al crear: ${err.message}`, severity: "error" });
    } else {
      setToast({ open: true, msg: "Portafolio creado", severity: "success" });
      // Refresh portfolios list
      fetchPortfolios();
    }
  };

  
  //const rows = DUMMY.holdingsByPortfolio[selected] ?? []
  /*const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0)
      return m
    }, {})
    return Object.entries(byType).map(([label, value]) => ({ label, value }))
  }, [rows])*/

   const series = useMemo(() => {
    // We'll update this once we have the holdings data
    const holdings = []  // This will come from the API
    const byType = holdings.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0)
      return m
    }, {})
    return Object.entries(byType).map(([label, value]) => ({ label, value }))
  }, [selected])  // Update dependency to selected

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

  // UI estado para crear
    const [openCreate, setOpenCreate] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
  
    /*const handleCreated = (err) => {
      if (err) {
        setToast({ open: true, msg: `Error al crear: ${err.message}`, severity: "error" });
      } else {
        setToast({ open: true, msg: "Portafolio creado", severity: "success" });
        // TODO: aquí puedes hacer re-fetch de portfolios reales cuando los conectes a la API
      }
    };*/

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
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<CreateNewFolderIcon />}
            sx={{ 
              borderRadius: '20px',
              mr: 1,
              color: '#00674F',
              borderColor: '#00674F',
              '&:hover': { 
                backgroundColor: '#e6f7f2',
                borderColor: '#00674F'
              }
            }}
            //onClick={() => alert('Add portfolio functionality')}
            onClick={() => setOpenCreate(true)}
          >
            Add
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<FolderDeleteIcon />}
            sx={{ 
              borderRadius: '20px',
              color: red[700],
              borderColor: red[700],
              '&:hover': { 
                backgroundColor: '#ffebee', 
                borderColor: red[700]
              }
            }}
            disabled={!selected}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this portfolio?')) {
                alert(`Delete portfolio ${selected}`);
              }
            }}
          >
            Delete
          </Button>
        </Grid>
      </Grid>
    )}
      {/*{DUMMY.portfolios.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`px-3 py-1 rounded-full border ${selected === p.id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
            >
              {p.name}
            </button>
          ))}*/}
      <Grid container>
        <Grid size={4} spacing={2}>
          <Card sx={{p:2, bgcolor: "#00674F", color: "#FFFFFF"}}>
            <Grid container spacing={4} justifyContent="center">
              <Grid sx={{borderColor: "blue", border: '2px solid white', display: "flex"}} size={6} justifyContent="center">
                <Typography sx={{fontWeight: "bold", fontSize: "1.5rem", color: "#BB77FF"}}>My portfolio</Typography>
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
                  <CardContent>
                    {selected ? (
                      <PortfolioTable portfolioId={selected} />
                    ) : (
                      <Typography sx={{ p: 2, textAlign: 'center' }}>
                        Select a portfolio to view holdings
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
            {/* Flowbite Chart.js Doughnut Chart */}
            <div className="mt-6 bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <canvas ref={chartRef} className="w-full max-w-xs" />
            </div>
          </Card>          
        </Grid>
        <Grid size={4}>        
          <StocksSidebar />
      {/*</div>*/}        
        </Grid>   
        </Grid>     
        {/* Add the table here */}      
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
    //</div>
  )
}