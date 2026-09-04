import { Tip } from '../types';

export function TipsList({ tips }: { tips: Tip[] }) {
  return <ul className="space-y-3" aria-label="Wellness tips">{tips.map((tip, index) =>
    <li key={`${tip.kind}-${index}`} className={`rounded-xl border p-3 ${tip.severity === 'attention' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
      <span aria-hidden="true">{tip.severity === 'attention' ? '💡' : '🌿'}</span> {tip.message}
    </li>
  )}</ul>;
}
