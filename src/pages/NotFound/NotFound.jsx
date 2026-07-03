import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import GlassCard from "../../components/common/GlassCard";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <GlassCard className={styles.card}>
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/">
        <Button>Voltar ao início</Button>
      </Link>
    </GlassCard>
  );
}
