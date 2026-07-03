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
import { formatCurrency, formatDate, getAccountStatusLabel } from "../../utils/formatters";
import styles from "./Despesas.module.css";

export default function Despesas() {
  const { items, loading, busca, setBusca, filtro, setFiltro, addItem, updateItem, removeItem } = useFinanceData(initialExpenses, ["title", "category", "status"]);
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
        { key: "status", label: "Status", render: (row) => <span className={styles.status}>{getAccountStatusLabel(row.status)}</span> },
      {
        key: "paidThisMonth",
        label: "Pago (mês vigente)",
        render: (row) => <input className={styles.checkbox} type="checkbox" checked={!!row.paidThisMonth} onChange={() => handlePaidToggle(row.id, !row.paidThisMonth)} />,
      },
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

  useEffect(() => {
    getUpcomingExpenseReminders(items, 7).forEach((item) => {
      if (reminderIdsRef.current.has(item.id)) return;

      reminderIdsRef.current.add(item.id);
      const label = item.daysUntil === 0 ? "hoje" : item.daysUntil === 1 ? "amanhã" : `em ${item.daysUntil} dias`;
      toast(`Atenção: ${item.title} vence ${label}`, { icon: "⏰" });
    });
  }, [items]);

  const visibleItems = useMemo(() => items.filter((item) => item.date?.slice(0, 7) === selectedMonth), [items, selectedMonth]);

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: Number(expense.amount).toFixed(2),
      date: expense.date,
      category: expense.category,
      status: expense.status,
      recurrence: expense.recurrence || "none",
      reminderDays: expense.reminderDays || "7",
      installments: expense.installments || "1",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    setForm({ title: "", amount: "", date: "", category: "moradia", status: "pending", recurrence: "none", reminderDays: "7", installments: "1" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      ...form,
      amount: Number(form.amount),
      recurrence: form.recurrence,
      reminderDays: Number(form.reminderDays),
      installments: form.recurrence === "monthly" ? Number(form.installments) : 1,
      paidThisMonth: editingExpense?.paidThisMonth || false,
    };

    if (editingExpense) {
      updateItem(editingExpense.id, payload);
      toast.success("Despesa atualizada");
    } else {
      addItem({ id: createId(), ...payload });
      toast.success("Despesa adicionada");
      if (payload.recurrence === "monthly") {
        toast(`Recorrência mensal ativada para ${payload.title}.`, { icon: "🔔" });
      }
    }
    closeModal();
  };

  const handlePaidToggle = (id, checked) => {
    updateItem(id, { paidThisMonth: checked });
    toast.success(checked ? "Despesa marcada como paga para o mês vigente" : "Marcador de pagamento removido");
  };

  const handleDelete = (id) => {
    removeItem(id);
    toast.success("Despesa removida");
  };

  const closeStatement = () => {
    setStatementModalOpen(false);
    setStatementExpense(null);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.page}>
      <PageTitle eyebrow="Controle de despesas" title="Mantenha as saídas sob controle" description="Organize gastos por categoria e acompanhe o que está próximo de vencer." />
      <GlassCard className={styles.toolbar}>
        <div className={styles.controls}>
          <SearchBar value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar despesa" />
          <Select
            id="expense-filter"
            value={filtro}
            onChange={(value) => setFiltro(value)}
            options={[
              { value: "all", label: "Todas" },
              { value: "pending", label: "Pendentes" },
              { value: "paid", label: "Pagas" },
              { value: "scheduled", label: "Agendadas" },
            ]}
          />
          <input type="month" className={styles.select} value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
          <Button onClick={() => setModalOpen(true)}>+ Nova despesa</Button>
        </div>
      </GlassCard>

      {visibleItems.length ? (
        <GlassCard className={styles.card}>
          <Table columns={columns} rows={visibleItems} emptyMessage="Nenhuma despesa disponível" />
        </GlassCard>
      ) : (
        <EmptyState title="Nenhuma despesa cadastrada" description="Adicione seu primeiro gasto para começar" action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nova despesa</Button>} />
      )}

      <Modal open={modalOpen} title={editingExpense ? "Editar despesa" : "Nova despesa"} onClose={closeModal}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-title">Descrição</label>
            <Input id="expense-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Descrição" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-amount">Valor</label>
            <Input id="expense-amount" type="number" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Valor" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-date">Data de vencimento</label>
            <Input id="expense-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-category">Categoria</label>
            <Select
              id="expense-category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={[
                { value: "moradia", label: "Moradia" },
                { value: "alimentacao", label: "Alimentação" },
                { value: "servicos", label: "Serviços" },
                { value: "outros", label: "Outros" },
              ]}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-recurrence">Recorrência</label>
            <Select
              id="expense-recurrence"
              value={form.recurrence}
              onChange={(value) => setForm({ ...form, recurrence: value, installments: value === "monthly" ? form.installments : "1" })}
              options={[
                { value: "none", label: "Única" },
                { value: "monthly", label: "Mensal" },
              ]}
            />
          </div>
          {form.recurrence === "monthly" ? (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="expense-installments">Parcelas</label>
              <Input id="expense-installments" type="number" min="1" value={form.installments} onChange={(event) => setForm({ ...form, installments: event.target.value })} placeholder="Nº de parcelas" />
            </div>
          ) : null}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="expense-reminder">Aviso de vencimento</label>
            <Select
              id="expense-reminder"
              value={form.reminderDays}
              onChange={(value) => setForm({ ...form, reminderDays: value })}
              options={Array.from({ length: 7 }, (_, index) => {
                const value = String(index + 1);
                return { value, label: `${value} dia${value !== "1" ? "s" : ""}` };
              })}
            />
          </div>
          {form.recurrence !== "monthly" ? (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="expense-status">Status</label>
              <Select
                id="expense-status"
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
                options={[
                  { value: "pending", label: "Pendente" },
                  { value: "paid", label: "Paga" },
                  { value: "scheduled", label: "Agendada" },
                ]}
              />
            </div>
          ) : null}
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={statementModalOpen} title={statementExpense ? `Extrato de ${statementExpense.title}` : "Extrato"} onClose={closeStatement}>
        {statementExpense ? (
          <div className={styles.statementList}>
            <div className={styles.statementCard}>
              <strong>Entradas</strong>
              <p>{formatCurrency(Math.round(statementExpense.amount * 0.6))}</p>
              <small>Recebimentos previstos para o mês</small>
            </div>
            <div className={styles.statementCard}>
              <strong>Saídas</strong>
              <p>{formatCurrency(Math.round(statementExpense.amount * 0.4))}</p>
              <small>Pagamentos associados à despesa</small>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
