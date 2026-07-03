import { motion } from "framer-motion";
import styles from "./GlassCard.module.css";

export default function GlassCard({ children, className = "", as: Component = "div", ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`${styles.card} ${className}`.trim()}
      as={Component}
      {...props}
    >
      {children}
    </motion.div>
  );
}
