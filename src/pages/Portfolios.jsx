//import Card from '../components/Card'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PortfolioTable from '../components/PortfolioTable'
import DonutChart from '../components/DonutChart'
import { DUMMY } from '../services/dummy'
import StocksSidebar from '../components/StocksSidebar'
import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Grid, Table, TableContainer, Paper, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { lightBlue, red } from '@mui/material/colors';


export default function Portfolios() {
  const [selected, setSelected] = useState(1)
  const rows = DUMMY.holdingsByPortfolio[selected] ?? []
  const series = useMemo(() => {
    const byType = rows.reduce((m, r) => {
      m[r.type] = (m[r.type] || 0) + Number(r.quantity || 0)
      return m
    }, {})
    return Object.entries(byType).map(([label, value]) => ({ label, value }))
  }, [rows])    

  return (
    //<div style= {{"background-color: lightblue"}}>
    <Container >
      {DUMMY.portfolios.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`px-3 py-1 rounded-full border ${selected === p.id ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
            >
              {p.name}
            </button>
          ))}
      <Grid container>
        <Grid size={4}>
          {/*}<div className="flex gap-2">*/}      

      {/*</div>*/}
      {/*<div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">*/}
          {/* <Card variant="outlined">
                    My Portfolio
              <div class="...">
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>          
                </button>
              </div>              
              <PortfolioTable rows={rows} />
          </Card> --> */}
            <Card sx={{pt: 4, pl: 2, pb: 2, bgcolor: "#00674F", color: "#FFFFFF"}}>
              <Grid container spacing={4}>
                <Grid sx={{borderColor: "blue"}} size={6} justifyItems ={"center"}>
                  My portfolio
                </Grid>
                <Grid sx={{borderColor: "blue"}} size={6}>
                  <Box flexDirection={'row-reverse'}>
                    <button className="p-2 rounded hover:bg-green-200 transition-colors">
                    <CreateNewFolderIcon />
                  </button>
                  {/*<button className="p-2 rounded hover:bg-green-200 transition-colors">*/}
                  <Button sx={{color: "red", ':hover': {bgcolor: 'red', color: 'white'}}}>
                    <FolderDeleteIcon/>
                    {/*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>*/}
                  </Button>    
                  </Box>                                    
                </Grid>
              </Grid>
              {/*<TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Symbol</TableCell>
                      <TableCell align="right">Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Avg. Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <PortfolioTable rows={rows} />                
                  </TableBody>
                </Table>
              </TableContainer>*/}                
                <PortfolioTable rows={rows} />
            </Card>
        </Grid>        
        <Grid size={4}>
          <Card title="Graph (dummy)">
            <DonutChart series={series} />
          </Card>
        </Grid>
        <Grid size={4}>        
          <StocksSidebar />
      {/*</div>*/}        
        </Grid>   
        </Grid>                                             
    </Container>      
    //</div>
  )
}
