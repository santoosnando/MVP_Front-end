import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const updateRect = () => {
      const rect = selectRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuRect(rect);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);
  const measuredRect = menuRect ?? selectRef.current?.getBoundingClientRect();
  const menuStyle = measuredRect
    ? { position: "fixed", top: measuredRect.bottom, left: measuredRect.left, width: measuredRect.width, zIndex: 9999 }
    : { position: "fixed", top: 0, left: 0, width: selectRef.current?.offsetWidth || "100%", zIndex: 9999 };

  const menu = (
    <ul
      className={`${styles.options} ${open ? styles.open : ""}`}
      role="listbox"
      aria-labelledby={id}
      style={menuStyle}
    >
      {options.map((option) => (
        <li
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          className={`${styles.option} ${option.value === value ? styles.selected : ""}`}
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
        >
          {option.label}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${styles.wrapper} ${className}`} ref={selectRef} data-select="true">
      <button
        type="button"
        id={id}
        name={name}
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown size={16} />
      </button>
      {open ? createPortal(menu, document.body) : null}
    </div>
  );
}
