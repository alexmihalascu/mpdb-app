import { useId } from 'react';

/**
 * A labelled control with hint and error text wired up for screen readers.
 *
 * Every input in the app goes through this so the label/description/error
 * relationship is never forgotten -- the original forms had bare labels with
 * no association at all.
 */
export function Field({
  label,
  error,
  hint,
  required = false,
  as = 'input',
  children,
  className = '',
  ...control
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  const shared = {
    id,
    className: 'field__control',
    required,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    ...control,
  };

  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      {as === 'select' ? (
        <select {...shared}>{children}</select>
      ) : as === 'textarea' ? (
        <textarea {...shared} />
      ) : (
        <input {...shared} />
      )}

      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
