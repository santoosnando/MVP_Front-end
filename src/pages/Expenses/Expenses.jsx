import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Trash2, PencilLine } from "lucide-react";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import GlassCard from "../../components/common/GlassCard";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import PageTitle from "../../components/common/PageTitle";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import { expenses as initialExpenses } from "../../data/expenses";
import { useFinanceData } from "../../hooks/useFinanceData";
import { createId, getUpcomingExpenseReminders } from "../../services/financeService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./Expenses.module.css";

export default function Expenses() {
  const { items, loading, busca, setBusca, filtro, setFiltro, addItem, updateItem, removeItem } = useFinanceData(initialExpenses, ["title", "category"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [statementExpense, setStatementExpense] = useState(null);
  const reminderIdsRef = useRef(new Set());
  const [form, setForm] = useState({ title: "", amount: "", date: "", category: "moradia", status: "pending", recurrence: "none", reminderDays: "7", installments: "1" });

  const columns = useMemo(
    () => [
      { key: "title", label: "Descrição" },
      { key: "amount", label: "Valor", render: (row) => formatCurrency(row.amount) },
      { key: "date", label: "Data", render: (row) => formatDate(row.date) },
      { key: "category", label: "Categoria" },
      {
        key: "recurrence",
        label: "Recorrência",
        render: (row) => <span className={styles.badge}>{row.recurrence === "monthly" ? `Mensal • ${row.installments || 1}x` : "Única"}</span>,
      },
      {
        key: "paidThisMonth",
        label: "Pago (mês vigente)",
        render: (row) => <input className={styles.checkbox} type="checkbox" checked={!!row.paidThisMonth} onChange={() => handlePaidToggle(row.id, !row.paidThisMonth)} />,
      },
      {
        export { default } from "../Despesas/Despesas";
        label: "Ações",
