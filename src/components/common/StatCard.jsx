import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import styles from "./StatCard.module.css";

export default function StatCard({ title, value, hint, icon: Icon, trend, tone = "default", onIconClick, iconLabel }) {
  return (
    <GlassCard className={styles.card}>
      <div className={styles.top}>
        <span className={styles.title}>{title}</span>
        {Icon ? (
          <button type="button" className={`${styles.icon} ${styles[tone]}`} onClick={onIconClick} aria-label={iconLabel || title} disabled={!onIconClick}>
            <Icon size={18} />
          </button>
        ) : null}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={styles.value}>
        {value}
      </motion.div>
      <div className={styles.meta}>
        <span>{hint}</span>
        {trend ? <span className={styles.trend}>{trend}</span> : null}
      </div>
    </GlassCard>
  );
}
