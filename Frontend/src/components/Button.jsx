export default function Button({
  variant = 'primary',
  size,
  block = false,
  cargando = false,
  type = 'button',
  className = '',
  disabled,
  children,
  ...props
}) {
  const clases = [
    'btn',
    `btn--${variant}`,
    size && `btn--${size}`,
    block && 'btn--block',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={clases}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...props}
    >
      {cargando && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
