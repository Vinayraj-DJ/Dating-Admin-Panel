import styles from "./Button.module.css";

function Button({
  children,
  onClick,
  variant = "default", // 'default' or 'outlined'
  backgroundColor,
  textColor,
  borderColor,
}) {
  const buttonClass =
    variant === "outlined"
      ? `${styles.button} ${styles.outlined}`
      : styles.button;

  const customStyle = {
    ...(backgroundColor && { background: backgroundColor }),
    ...(textColor && { color: textColor }),
    ...(borderColor && {
      border: `1px solid ${borderColor}`,
      color: borderColor,
    }),
  };

  return (
    <button className={buttonClass} style={customStyle} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
