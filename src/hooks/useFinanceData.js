import { useEffect, useMemo, useState } from "react";
import { getAccountStatusLabel } from "../utils/formatters";

export function useFinanceData(initialItems, searchKeys = []) {
  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(initialItems);
      setLoading(false);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [initialItems]);

  const itensFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    return items.filter((item) => {
      const correspondeBusca =
        buscaNormalizada.length === 0 ||
        searchKeys.some((key) => {
          const rawValue = String(item[key]).toLowerCase();
          const statusLabel = key === "status" ? getAccountStatusLabel(item[key]).toLowerCase() : "";

          return rawValue.includes(buscaNormalizada) || statusLabel.includes(buscaNormalizada);
        });

      const correspondeFiltro =
        filtro === "all" || item.status === filtro || item.category === filtro;

      return correspondeBusca && correspondeFiltro;
    });
  }, [filtro, items, busca, searchKeys]);

  const addItem = (item) => setItems((prev) => [item, ...prev]);
  const updateItem = (id, updates) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  return {
    items: itensFiltrados,
    loading,
    busca,
    setBusca,
    filtro,
    setFiltro,
    addItem,
    updateItem,
    removeItem,
  };
}
