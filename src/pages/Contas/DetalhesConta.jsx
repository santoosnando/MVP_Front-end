import { useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import GlassCard from "../../components/common/GlassCard";
import PageTitle from "../../components/common/PageTitle";
import { accounts } from "../../data/accounts";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./Contas.module.css";

export default function DetalhesConta() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const account = useMemo(() => accounts.find((a) => a.id === id), [id]);

  if (!account) {
    return (
      <div className={styles.page}>
        <PageTitle eyebrow="Conta" title="Conta não encontrada" description="A conta não existe." />
        <GlassCard className={styles.card}>
          <p>Conta não localizada.</p>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle eyebrow="Conta" title={`Extrato — ${account.name}`} description={`Visualizando extrato. (fonte: ${location.pathname})`} />
      <GlassCard className={styles.card}>
        <div>
          <strong>Nome</strong>
          <p>{account.name}</p>
        </div>
        <div>
          <strong>Saldo</strong>
          <p>{formatCurrency(account.balance)}</p>
        </div>
        <div>
          <strong>Vencimento</strong>
          <p>{formatDate(account.dueDate)}</p>
        </div>
      </GlassCard>
    </div>
  );
}
