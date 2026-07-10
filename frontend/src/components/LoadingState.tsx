export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return <div className="panel muted" aria-live="polite">{label}</div>;
}
