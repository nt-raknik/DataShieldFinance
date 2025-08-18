
import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'
import * as React from 'react'
import {Box, Button, Typography, Modal} from '@mui/material'
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,

}


export default function Home() {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
      <Card title="Bienvenido(a)" right={<span className="text-xs text-neutral-500">Explore your portfolio</span>}>
        <p className="text-sm text-neutral-600">
          Go to <strong>Portfolios</strong> to review your positions. On the Home page, you'll find Mexican financial news and a dummy watchlist.
        </p>
        <div> </div>
        <div className='py-5'> 
          <button onClick={handleOpen} className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Personal Finances</button>
          <Modal 
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-Personal-Finances"
          >
            <Box sx={style}>
            <Typography id="modal-Personal-Finances" sx={{ mt:2}}>
          50% Needs: Rent, Food, Transportation, Utilities, Healthcare, etc.
          30% Wants: Outlings, Trips, Personal shopping, Entretainment, etc.
          20% Savings & Investment: Emergency Found, Savings for Goals, Retirement Contributions or Investments.
            </Typography>
            </Box>
          </Modal>
          </div>
        
        <div className='py-5'><button className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Basic Concepts</button></div>
        <div className='py-5'><button className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Type of Investments</button></div>
        <div className='py-5'><button className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Habbits and Tips</button></div>
      </Card>
      <NewsWidget />
      <StocksSidebar />
    </div>
  )
}
