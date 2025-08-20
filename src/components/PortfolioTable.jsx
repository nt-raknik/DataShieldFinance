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
  Alert 
} from '@mui/material';

export default function PortfolioTable({ portfolioId }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/assets/${portfolioId}`);
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
    <TableContainer component={Paper}>
      <Table size="small" aria-label="portfolio holdings table">
        <TableHead>
          <TableRow>
            <TableCell>Ticker</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Avg. price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">No holdings found</TableCell>
            </TableRow>
          ) : (
            holdings.map((h) => (
              <TableRow
                key={h.holding_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                  {h.ticker}
                </TableCell>
                <TableCell>{h.type}</TableCell>
                <TableCell align="right">{h.quantity}</TableCell>
                <TableCell align="right">{h.avg_price ?? '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}