import { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';

export default function PortfolioHoldings({ portfolioId }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchHoldings = async () => {
      try {
        setLoading(true);
        // Using the existing portfolios endpoint that already has the correct query
        const res = await fetch(`/api/portfolios/${portfolioId}/holdings`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setHoldings(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Error fetching holdings");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    if (portfolioId) {
      fetchHoldings();
    }

    return () => { alive = false; };
  }, [portfolioId]);

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <div className="flex justify-center p-4">
          <CircularProgress />
        </div>
      </TableContainer>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      {/*<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Current Holdings</Typography>*/}
      <TableContainer 
      component={Paper}
      sx={{ 
        maxHeight: 300, // Set maximum height to enable vertical scrolling
        overflow: 'auto' // Ensure scrollbars appear when content exceeds dimensions
      }}
    >
      <Table size="small" aria-label="portfolio holdings table" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Ticker</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price ($)</TableCell>
            <TableCell align="right">Fees ($)</TableCell>
            <TableCell align="right">Total Value ($)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No holdings found</TableCell>
              </TableRow>
            ) : (
              holdings.map((holding) => (
                <TableRow
                  key={holding.asset_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                    {holding.symbol}
                  </TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell align="right">{holding.quantity}</TableCell>
                  <TableCell align="right">{Number(holding.price).toFixed(2)}</TableCell>
                  <TableCell align="right">{Number(holding.fees).toFixed(2)}</TableCell>
                  <TableCell align="right">{(Number(holding.quantity) * Number(holding.price)).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}