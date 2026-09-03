export function Loading({ label = 'Loading' }: { label?: string }) {
  return <div className="card text-center" role="status"><span className="inline-block animate-pulse">🐾</span> {label}…</div>;
}

export function ErrorState({ error }: { error: unknown }) {
  return <div className="card border-red-200 bg-red-50 text-red-800" role="alert">{error instanceof Error ? error.message : 'Something went wrong.'}</div>;
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <section className="card py-10 text-center"><div className="text-4xl" aria-hidden="true">🐾</div><h2 className="mt-3 text-xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-md text-slate-600">{message}</p>{action && <div className="mt-5">{action}</div>}</section>;
}
