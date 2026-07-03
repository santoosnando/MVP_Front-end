import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Contas from "../pages/Contas/Contas";
import DetalhesConta from "../pages/Contas/DetalhesConta";
import Despesas from "../pages/Despesas/Despesas";
import Receitas from "../pages/Receitas/Receitas";
import Configuracoes from "../pages/Configuracoes/Configuracoes";
import NotFound from "../pages/NotFound/NotFound";

export default function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="contas" element={<Contas />} />
        <Route path="contas/:id" element={<DetalhesConta />} />
        <Route path="despesas" element={<Despesas />} />
        <Route path="receitas" element={<Receitas />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="404" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
