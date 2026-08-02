import { Link } from 'react-router-dom';

/**
 * Buttons and link-buttons share one visual contract.
 *
 * `loading` disables the control and announces the busy state instead of
 * silently swallowing repeat clicks.
 */
export function Button({
  variant = 'ghost',
  size,
  block = false,
  loading = false,
  to,
  href,
  children,
  className = '',
  disabled,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'lg' ? 'btn--lg' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
