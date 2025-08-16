import { useState, useEffect } from "react";
import axios from "axios";
import PortfolioList from "./components/PortfolioList";
import PortfolioForm from "./components/PortfolioForm";

function App() {
  const [portfolios, setPortfolios] = useState([]);
  const userId = 1; // Usuario fijo de prueba

  const fetchPortfolios = async () => {
    const res = await axios.get(`http://localhost:3000/users/${userId}/portfolios`);
    setPortfolios(res.data);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Mis Portafolios</h1>
      <PortfolioForm userId={userId} onAdded={fetchPortfolios} />
      <PortfolioList portfolios={portfolios} onChanged={fetchPortfolios} />
    </div>
  );
}

export default App;