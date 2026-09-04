import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export function WellnessForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: (data: object) => api(`/pets/${id}/wellness`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ['pet', id] }), client.invalidateQueries({ queryKey: ['pets'] }), client.invalidateQueries({ queryKey: ['tips', id] })]); navigate(`/pets/${id}`); },
    onError: (err) => setError(err instanceof Error ? err.message : 'Unable to add entry')
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    mutation.mutate({
      weight: form.get('weight') ? Number(form.get('weight')) : null,
      activityMinutes: form.get('activity') ? Number(form.get('activity')) : null,
      mood: form.get('mood') || null,
      notes: form.get('notes') || null,
      recordedAt: new Date(String(form.get('recordedAt'))).toISOString()
    });
  }
  return <div className="mx-auto max-w-xl"><Link to={`/pets/${id}`} className="text-sm font-semibold text-coral">← Pet profile</Link><h1 className="page-title mt-3">Log wellness</h1><p className="mt-2 text-slate-600">A quick snapshot makes trends easier to notice.</p>
    <form className="card mt-6 space-y-5" onSubmit={submit}>{error && <p role="alert" className="text-red-700">{error}</p>}
      <div><label htmlFor="recordedAt">Date and time</label><input id="recordedAt" name="recordedAt" type="datetime-local" required defaultValue={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="wellness-weight">Weight (kg)</label><input id="wellness-weight" name="weight" type="number" min="0.01" step="0.01" /></div><div><label htmlFor="activity">Activity (minutes)</label><input id="activity" name="activity" type="number" min="0" max="1440" /></div></div>
      <div><label htmlFor="mood">Mood</label><select id="mood" name="mood" defaultValue=""><option value="">Not recorded</option><option>Happy</option><option>Playful</option><option>Calm</option><option>Tired</option><option>Anxious</option><option>Unwell</option></select></div>
      <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={4} maxLength={1000} placeholder="Appetite, sleep, behavior…" /></div>
      <button className="btn w-full" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save wellness entry'}</button>
    </form>
  </div>;
}
