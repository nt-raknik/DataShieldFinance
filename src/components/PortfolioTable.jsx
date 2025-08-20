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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Change the endpoint to fetch transaction data instead of assets
        const res = await fetch(`/api/transactions/${portfolioId}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setTransactions(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Error fetching transactions");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    if (portfolioId) {
      fetchTransactions();
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
    <TableContainer 
      component={Paper}
      sx={{ 
        maxHeight: 300, // Set maximum height to enable vertical scrolling
        overflow: 'auto' // Ensure scrollbars appear when content exceeds dimensions
      }}
    >
      <Table size="small" aria-label="portfolio transactions table" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Fees</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">No transactions found</TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow
                key={tx.transaction_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                  {tx.symbol}
                </TableCell>
                <TableCell>{tx.name}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell align="right">{tx.quantity}</TableCell>
                <TableCell align="right">${Number(tx.price).toFixed(2)}</TableCell>
                <TableCell align="right">${Number(tx.fees).toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}