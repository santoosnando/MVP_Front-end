import { Search } from "lucide-react";
import Input from "./Input";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, placeholder = "Buscar" }) {
  return (
    <label className={styles.search}>
      <Search size={18} />
      <Input className={styles.field} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}
