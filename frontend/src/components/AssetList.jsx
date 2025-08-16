import { useState, useEffect } from "react";
import axios from "axios";

function AssetList({ portfolioId }) {
  const [assets, setAssets] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");

  const fetchAssets = async () => {
    const res = await axios.get(
      `http://localhost:3000/portfolios/${portfolioId}/assets`
    );
    setAssets(res.data);
  };

  const fetchAvailableAssets = async () => {
    const res = await axios.get("http://localhost:3000/assets");
    setAvailableAssets(res.data);
  };

  const addAsset = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    await axios.post(`http://localhost:3000/portfolios/${portfolioId}/assets`, {
      asset_id: selectedAsset,
    });
    setSelectedAsset("");
    fetchAssets();
  };

  const removeAsset = async (id) => {
    await axios.delete(
      `http://localhost:3000/portfolios/${portfolioId}/assets/${id}`
    );
    fetchAssets();
  };

  useEffect(() => {
    fetchAssets();
    fetchAvailableAssets();
  }, [portfolioId]);

  return (
    <div className="mt-2 pl-4">
      <h3 className="font-medium mb-2">Activos:</h3>

      {/* Formulario para agregar asset */}
      <form onSubmit={addAsset} className="flex gap-2 mb-3">
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="border p-1 rounded w-full"
          required
        >
          <option value="">Selecciona un activo</option>
          {availableAssets.map((a) => (
            <option key={a.asset_id} value={a.asset_id}>
              {a.symbol} - {a.name}
            </option>
          ))}
        </select>
        <button className="bg-green-500 text-white px-3 py-1 rounded">
          ➕ Agregar
        </button>
      </form>

      {assets.length === 0 ? (
        <p className="text-gray-500">Sin activos.</p>
      ) : (
        <ul className="list-disc ml-4">
          {assets.map((a) => (
            <li key={a.asset_id} className="flex justify-between items-center">
              <span>
                {a.symbol} - {a.name}
              </span>
              <button
                onClick={() => removeAsset(a.asset_id)}
                className="text-red-600 ml-2"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AssetList;