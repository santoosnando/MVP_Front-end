import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Toast from "../common/Toast";
import styles from "./layout.module.css";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Header />
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}