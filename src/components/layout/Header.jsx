import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../common/Modal";
import { accounts } from "../../data/accounts";
import { expenses } from "../../data/expenses";
import { formatCurrency, formatDate, getAccountStatusLabel } from "../../utils/formatters";
import styles from "./Header.module.css";

const labels = {
  "/": "Visão geral",
  "/contas": "Contas",
  "/despesas": "Despesas",
  "/receitas": "Receitas",
  "/configuracoes": "Configurações",
};

export default function Header() {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = useMemo(() => {
    const accountAlerts = accounts.map((account) => ({
      id: `account-${account.id}`,
      title: `Conta ${account.name}`,
      description: `${getAccountStatusLabel(account.status)} · vence em ${formatDate(account.dueDate)}`,
      meta: formatCurrency(account.balance),
    }));

    const expenseAlerts = expenses.map((item) => ({
      id: `expense-${item.id}`,
      title: item.title,
      description: `${getAccountStatusLabel(item.status)} · ${formatDate(item.date)}`,
      meta: formatCurrency(item.amount),
    }));

    return [...accountAlerts, ...expenseAlerts].slice(0, 5);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Aura Finance</p>
          <h2>{labels[location.pathname] ?? "Painel"}</h2>
        </div>
        <div className={styles.actions}>
          <button className={styles.iconButton} aria-label="Notificações" onClick={() => setNotificationsOpen(true)}>
            <Bell size={18} />
          </button>
        </div>
      </header>

      <Modal open={notificationsOpen} title="Notificações" onClose={() => setNotificationsOpen(false)}>
        <div className={styles.notifications}>
          {notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.description}</p>
              </div>
              <span>{notification.meta}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
