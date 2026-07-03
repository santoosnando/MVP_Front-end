import { LayoutDashboard, Landmark, Receipt, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/receitas", label: "Receitas", icon: Landmark },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img className={styles.logo} src="/aura-logo.png" alt="Aura Finance" />
        <div>
          <h2>Aura</h2>
          <p>Finance</p>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul>
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
