import { useMemo, useState } from "react";
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
import { income as initialIncome } from "../../data/income";
import { useFinanceData } from "../../hooks/useFinanceData";
import { createId } from "../../services/financeService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./Receitas.module.css";

export default function Receitas() {
  const { items, loading, busca, setBusca, filtro, setFiltro, addItem, updateItem, removeItem } = useFinanceData(initialIncome, ["title"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ title: "", amount: "", date: "", recurrence: "none" });

  const columns = useMemo(
    () => [
      { key: "title", label: "Descrição" },
      { key: "amount", label: "Valor", render: (row) => formatCurrency(row.amount) },
      { key: "date", label: "Data", render: (row) => formatDate(row.date) },
      {
        key: "actions",
        label: "Ações",
        render: (row) => (
          <div className={styles.actions}>
            <button className={styles.iconButton} onClick={() => openEdit(row)}>
              <PencilLine size={16} />
            </button>
            <button className={styles.iconButton} onClick={() => handleDelete(row.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const visibleItems = useMemo(() => items.filter((item) => item.date?.slice(0, 7) === selectedMonth), [items, selectedMonth]);

  const openEdit = (income) => {
    setEditingIncome(income);
    setForm({ title: income.title, amount: income.amount, date: income.date, recurrence: income.recurrence || "none" });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIncome(null);
    setForm({ title: "", amount: "", date: "", recurrence: "none" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editingIncome) {
      updateItem(editingIncome.id, payload);
      toast.success("Receita atualizada");
    } else {
      addItem({ id: createId(), ...payload });
      toast.success("Receita adicionada");
    }
    closeModal();
  };

  const handleDelete = (id) => {
    removeItem(id);
    toast.success("Receita removida");
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.page}>
      <PageTitle eyebrow="Receitas" title="Controle de entradas" description="Registre ganhos e acompanhe o que chega no mês." />
      <GlassCard className={styles.toolbar}>
        <div className={styles.controls}>
          <SearchBar value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar receita" />
          <Select id="income-filter" value={filtro} onChange={(v) => setFiltro(v)} options={[{ value: "all", label: "Todas" }, { value: "pending", label: "Pendentes" }, { value: "paid", label: "Pagas" }]} />
          <input type="month" className={styles.select} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          <Button onClick={() => setModalOpen(true)}>+ Nova receita</Button>
        </div>
      </GlassCard>

      {visibleItems.length ? (
        <GlassCard className={styles.card}>
          <Table columns={columns} rows={visibleItems} emptyMessage="Nenhuma receita neste mês" />
        </GlassCard>
      ) : (
        <EmptyState title="Nenhuma receita registrada" description="Adicione entradas para começar a controlar." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nova receita</Button>} />
      )}

      <Modal open={modalOpen} title={editingIncome ? "Editar receita" : "Nova receita"} onClose={closeModal}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="income-title">Descrição</label>
            <Input id="income-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="income-amount">Valor</label>
            <Input id="income-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="income-date">Data</label>
            <Input id="income-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
