import styles from "./PageTitle.module.css";

export default function PageTitle({ eyebrow, title, description }) {
  return (
    <div className={styles.wrapper}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
