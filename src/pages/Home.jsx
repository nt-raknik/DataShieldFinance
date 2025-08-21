import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'
import Assets_req from '../components/Assets_req'
import * as React from 'react'
import {Box, Container, Button, Typography, Modal} from '@mui/material'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function Home() {
  const [open, setOpen] = React.useState("")
  const handleOpen = (modelName) => setOpen(modelName)
  const handleClose = () => setOpen("")
  return (
    <Container>    
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
      <Card title="Welcome" right={<span className="text-xs text-neutral-500">Explore your portfolio</span>}>
        <p className="text-sm text-neutral-600">
          Go to <strong>Portfolios</strong> to review your positions. On the Home page, you'll find Mexican financial news and a dummy watchlist.
        </p>
        <div> </div>
        <div className='py-5'> 
          <button onClick={() => handleOpen("modal-Personal-Finances")} className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Personal Finances</button>
          <Modal 
            open={open === "modal-Personal-Finances"}
            onClose={handleClose}
            aria-labelledby="modal-Personal-Finances"
          >
            <Box sx={style}>
            <Typography id="modal-Personal-Finances" sx={{ mt:2, fontSize: 20 }}>
            <p className='pb-4'>50% Needs: Rent, Food, Transportation, Utilities, Healthcare, etc.</p>
            <p className='pb-4'>30% Wants: Outlings, Trips, Personal shopping, Entretainment, etc.</p>
            <p className='pb-4'>20% Savings & Investment: Emergency Found, Savings for Goals, Retirement Contributions or Investments.</p>
            </Typography>
            </Box>
          </Modal>
          </div>
        
        <div className='py-5'>
          <button onClick={() => handleOpen("modal-Basic-Concepts")} className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Basic Concepts</button></div>
          <Modal 
            open={open === "modal-Basic-Concepts"}
            onClose={handleClose}
            aria-labelledby="modal-Basic-Concepts"
          >
            <Box sx={style}>
            <Typography id="modal-Basic-Concepts" sx={{ mt:2, fontSize: 20 }}>
            <p className='pb-4'>Investing vs saving: Saving keeps money safe, investing aims to grow it by taking risks.</p>
            <p className='pb-4'>Risk and return: Higher potential returns usually mean higher risk of loss.</p>
            <p className='pb-4'>Investment horizon: The length of time you plan to keep your money invested (short, medium, or long term).</p>
            <p className='pb-4'> Liquidity: How quickly and easily you can access your mone. </p>
            </Typography>
            </Box>
          </Modal>
        <div/>
        <div className='py-5'>
          <button onClick={() => handleOpen("modal-Type-Investments")} className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Type of Investments</button></div>
          <Modal 
            open={open === "modal-Type-Investments"}
            onClose={handleClose}
            aria-labelledby="modal-Type-Investments"
          >
            <Box sx={style}>
            <Typography id="modal-Type-Investments" sx={{ mt:2, fontSize: 20 }}>
            <p className='pb-4'>Fixed income (bonds, treasury bills, CETES): Safer, but lower returns.</p>
            <p className='pb-4'>Equities (stocks, ETFs, mutual funds): Potentially higher gains, but fluctuate in the short term.</p>
            <p className='pb-4'>Real estate (property or REITs): Long-term option, can provide rental income + value appreciation.</p>
            <p className='pb-4'>Retirement plans (401k, AFORE, pension funds): Essential to build long-term wealth</p>
            </Typography>
            </Box>
          </Modal>
          <div/>
        <div className='py-5'>
          <button onClick={() => handleOpen("modal-Habbits-Tips")} className={`px-5 py-2 rounded-full`} style={{backgroundColor:"green", color:"white"}}>Habbits and Tips</button></div>
          <Modal 
            open={open === "modal-Habbits-Tips"}
            onClose={handleClose}
            aria-labelledby="modal-Habbits-Tips"
          >
            <Box sx={style}>
            <Typography id="modal-Habbits-Tips" sx={{ mt:2, fontSize: 20 }}>
              <p className='pb-4'>Diversification: Don’t put all your money into one type of investment.</p>
              <p className='pb-4'>Compound interest: Reinvested earnings make your money grow exponentially over time.</p>
              <p className='pb-4'>Continuous learning: Read books, listen to podcasts, and follow economic news.</p>
              <p className='pb-4'>Discipline: Invest consistently (e.g., monthly) even if it’s a small amount.</p>
            </Typography>
            </Box>
          </Modal>
          <div/>
      </Card>
      <NewsWidget />
      <StocksSidebar />
      <Assets_req />
    </div>
    </Container>
  )
}