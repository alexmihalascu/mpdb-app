/**
 * Inline status message.
 *
 * Errors use `role="alert"` so assistive tech announces them as soon as they
 * appear; neutral and success notes are polite.
 */
export function Alert({ variant = 'info', children, className = '' }) {
  return (
    <div
      className={`alert alert--${variant} ${className}`.trim()}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
