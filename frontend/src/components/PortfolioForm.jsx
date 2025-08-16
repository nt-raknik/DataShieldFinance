import { useState } from "react";
import axios from "axios";

function PortfolioForm({ userId, onAdded }) {
  const [name, setName] = useState("");

  const addPortfolio = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:3000/users/${userId}/portfolios`, { name });
    setName("");
    onAdded();
  };

  return (
    <form onSubmit={addPortfolio} className="mb-4 flex gap-2">
      <input
        className="border p-2 rounded w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nuevo portafolio"
        required
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        ➕ Agregar
      </button>
    </form>
  );
}

export default PortfolioForm;