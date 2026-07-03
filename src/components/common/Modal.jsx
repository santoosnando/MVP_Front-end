import { X } from "lucide-react";
import styles from "./Modal.module.css";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
