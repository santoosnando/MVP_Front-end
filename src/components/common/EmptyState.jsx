import styles from "./EmptyState.module.css";

export default function EmptyState({ title, description, action }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
