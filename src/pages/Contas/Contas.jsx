import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, Plus, Trash2, PencilLine } from "lucide-react";
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
import { accounts as initialAccounts } from "../../data/accounts";
import { useFinanceData } from "../../hooks/useFinanceData";
import { createId } from "../../services/financeService";
import { formatCurrency, formatDate, getAccountStatusLabel } from "../../utils/formatters";
import styles from "./Contas.module.css";

export default function Contas() {
  const { items, loading, busca, setBusca, filtro, setFiltro, addItem, updateItem, removeItem } = useFinanceData(initialAccounts, ["name", "status"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [statementAccount, setStatementAccount] = useState(null);
  const [form, setForm] = useState({ name: "", balance: "", dueDate: "", status: "pending" });

  const columns = useMemo(
    () => [
      { key: "name", label: "Conta" },
      { key: "balance", label: "Saldo", render: (row) => formatCurrency(row.balance) },
      { key: "dueDate", label: "Vencimento", render: (row) => formatDate(row.dueDate) },
      { key: "status", label: "Status", render: (row) => <span className={styles.status}>{getAccountStatusLabel(row.status)}</span> },
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
            <button className={styles.iconButton} onClick={() => openStatement(row)}>
              <Eye size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const openEdit = (account) => {
    setEditingAccount(account);
    setForm({ name: account.name, balance: Number(account.balance).toFixed(2), dueDate: account.dueDate, status: account.status });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
    setForm({ name: "", balance: "", dueDate: "", status: "pending" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (editingAccount) {
      updateItem(editingAccount.id, { ...form, balance: Number(form.balance) });
      toast.success("Conta atualizada");
    } else {
      addItem({ id: createId(), ...form, balance: Number(form.balance) });
      toast.success("Conta adicionada");
    }
    closeModal();
  };

  const openStatement = (account) => {
    setStatementAccount(account);
    setStatementModalOpen(true);
  };

  const closeStatement = () => {
    setStatementModalOpen(false);
    setStatementAccount(null);
  };

  const handleDelete = (id) => {
    removeItem(id);
    toast.success("Conta removida");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.page}>
      <PageTitle eyebrow="Gestão de contas" title="Organize suas contas com clareza" description="Adicione, edite e acompanhe vencimentos em um painel elegante e responsivo." />
      <GlassCard className={styles.toolbar}>
        <div className={styles.controls}>
          <SearchBar value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar conta" />
          <Select
            id="account-filter"
            value={filtro}
            onChange={(value) => setFiltro(value)}
            options={[
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendentes" },
              { value: "paid", label: "Pagas" },
              { value: "scheduled", label: "Agendadas" },
            ]}
          />
          <Button onClick={() => setModalOpen(true)}>+ Nova conta</Button>
        </div>
      </GlassCard>

      {items.length ? (
        <GlassCard className={styles.card}>
          <Table columns={columns} rows={items} emptyMessage="Nenhuma conta disponível" />
        </GlassCard>
      ) : (
        <EmptyState title="Nenhuma conta cadastrada" description="Crie sua primeira conta para começar" action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nova conta</Button>} />
      )}

      <Modal open={modalOpen} title={editingAccount ? "Editar conta" : "Nova conta"} onClose={closeModal}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="account-name">Nome da conta</label>
            <Input id="account-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome da conta" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="account-balance">Saldo</label>
            <Input id="account-balance" type="number" step="0.01" value={form.balance} onChange={(event) => setForm({ ...form, balance: event.target.value })} placeholder="Saldo" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="account-dueDate">Data de vencimento</label>
            <Input id="account-dueDate" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="account-status">Status</label>
            <Select
              id="account-status"
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
              options={[
                { value: "pending", label: "Pendente" },
                { value: "paid", label: "Paga" },
                { value: "scheduled", label: "Agendada" },
              ]}
            />
          </div>
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={statementModalOpen} title={statementAccount ? `Extrato de ${statementAccount.name}` : "Extrato"} onClose={closeStatement}>
        {statementAccount ? (
          <div className={styles.statementList}>
            <div className={styles.statementCard}>
              <strong>Entradas</strong>
              <p>{formatCurrency(Math.round(statementAccount.balance * 0.7))}</p>
              <small>Recebimentos previstos para a conta</small>
            </div>
            <div className={styles.statementCard}>
              <strong>Saídas</strong>
              <p>{formatCurrency(Math.round(statementAccount.balance * 0.3))}</p>
              <small>Pagamentos previstos vinculados à conta</small>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
