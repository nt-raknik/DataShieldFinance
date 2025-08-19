import React, { useEffect, useState } from "react";
import Card from "./Card";

export default function PortfoliosSidebar() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Si configuraste proxy en Vite, usa "/api/portfolios/user/2"
        const res = await fetch("/api/portfolios/user/2");
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setItems(Array.isArray(data) ? data : []);
          setState({ loading: false, error: null });
        }
      } catch (err) {
        if (alive) setState({ loading: false, error: err.message || "Error" });
      }
    })();

    return () => { alive = false; };
  }, []);

  if (state.loading) {
    return (
      <Card title="Portfolios">
        <ul className="space-y-2 text-sm animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex justify-between border-t first:border-t-0 pt-1">
              <span className="h-4 w-40 bg-neutral-200 rounded" />
              <span className="h-4 w-24 bg-neutral-200 rounded" />
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card title="Portfolios">
        <p className="text-sm text-rose-600">Error: {state.error}</p>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card title="Portfolios">
        <p className="text-sm text-neutral-600">No hay portafolios.</p>
      </Card>
    );
  }

  return (
    <Card title="Portfolios">
      <ul className="space-y-2 text-sm">
        {items.map((p) => (
          <li
            key={p.portfolio_id}
            className="flex justify-between border-t first:border-t-0 pt-1"
            title={p.description || ""}
          >
            <span>{p.name}</span>
            <span className="text-neutral-500">
              {new Date(p.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
