import styles from "./Tooltip.module.css";

export default function Tooltip({ children, label }) {
  return (
    <div className={styles.wrapper}>
      {children}
      <span className={styles.tooltip}>{label}</span>
    </div>
  );
}
