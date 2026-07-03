import { useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import GlassCard from "../../components/common/GlassCard";
import styles from "./Configuracoes.module.css";

export default function Configuracoes() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className={styles.page}>
      <PageTitle eyebrow="Configurações" title="Notificações" description="Controle os avisos de vencimento do aplicativo." />
      <GlassCard className={styles.card}>
        <div className={styles.row}>
          <div>
            <strong>Notificações de vencimento</strong>
            <p>{notificationsEnabled ? "Avisos ativados" : "Avisos desativados"}</p>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
            />
            <span />
          </label>
        </div>
      </GlassCard>
    </div>
  );
}
