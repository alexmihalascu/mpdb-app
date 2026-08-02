export function LoadingPage({ label = 'Se incarca' }) {
  return (
    <div className="loading-page" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
