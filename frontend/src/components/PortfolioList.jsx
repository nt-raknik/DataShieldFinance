import axios from "axios";
import AssetList from "./AssetList";

function PortfolioList({ portfolios, onChanged }) {
  const deletePortfolio = async (id) => {
    await axios.delete(`http://localhost:3000/portfolios/${id}`);
    onChanged();
  };

  return (
    <div>
      {portfolios.map((p) => (
        <div key={p.portfolio_id} className="border rounded p-4 mb-4 shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <button
              onClick={() => deletePortfolio(p.portfolio_id)}
              className="text-red-600"
            >
              ❌ Eliminar
            </button>
          </div>
          <AssetList portfolioId={p.portfolio_id} />
        </div>
      ))}
    </div>
  );
}

export default PortfolioList;