import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { TipsList } from '../components/TipsList';
import { Pet, Tip } from '../types';

export function PetDetail() {
  const { id } = useParams();
  const pet = useQuery({ queryKey: ['pet', id], queryFn: () => api<Pet>(`/pets/${id}`) });
  const tips = useQuery({ queryKey: ['tips', id], queryFn: () => api<Tip[]>(`/tips/${id}`) });
  if (pet.isLoading) return <Loading label="Opening profile" />;
  if (pet.error) return <ErrorState error={pet.error} />;
  const item = pet.data!;
  const chart = (item.wellness || []).filter((entry) => entry.weight != null).slice().reverse().map((entry) => ({ date: new Date(entry.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), weight: entry.weight }));
  return <div className="space-y-7">
    <section className="card flex flex-col items-start gap-5 sm:flex-row sm:items-center"><img className="h-28 w-28 rounded-2xl bg-orange-50 object-cover" src={item.photoUrl || 'https://placehold.co/224x224/fff1e6/8b5e3c?text=Pet'} alt="" /><div className="flex-1"><p className="font-semibold text-coral">{item.species}</p><h1 className="page-title">{item.name}</h1><p className="text-slate-500">{item.breed || 'Wonderful companion'}{item.weight ? ` · ${item.weight} kg` : ''}</p></div><div className="flex flex-wrap gap-2"><Link className="btn-secondary" to={`/pets/${id}/edit`}>Edit</Link><Link className="btn" to={`/pets/${id}/wellness/new`}>Log wellness</Link></div></section>
    <nav className="flex gap-3" aria-label="Pet sections"><Link className="btn-secondary" to={`/pets/${id}/vaccinations`}>Vaccinations</Link></nav>
    <div className="grid gap-7 lg:grid-cols-3">
      <section className="card lg:col-span-2"><h2 className="mb-4 text-xl font-bold">Weight trend</h2>{chart.length ? <div className="h-64" aria-label="Weight trend chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={['auto', 'auto']} unit=" kg" width={60} /><Tooltip /><Line type="monotone" dataKey="weight" stroke="#df6d5b" strokeWidth={3} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div> : <EmptyState title="No weight history" message="Add a wellness log with weight to begin the trend." />}</section>
      <section className="card"><h2 className="mb-4 text-xl font-bold">Wellness tips</h2>{tips.isLoading ? <p role="status">Reviewing records…</p> : tips.error ? <ErrorState error={tips.error} /> : <TipsList tips={tips.data || []} />}</section>
    </div>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Wellness timeline</h2><Link className="btn-secondary" to={`/pets/${id}/wellness/new`}>Add entry</Link></div>
      {item.wellness?.length ? <ol className="space-y-3">{item.wellness.map((entry) => <li className="card" key={entry.id}><div className="flex flex-wrap justify-between gap-2"><time className="font-bold">{new Date(entry.recordedAt).toLocaleDateString()}</time><span className="text-sm text-slate-500">{[entry.weight && `${entry.weight} kg`, entry.activityMinutes != null && `${entry.activityMinutes} min`, entry.mood].filter(Boolean).join(' · ')}</span></div>{entry.notes && <p className="mt-2">{entry.notes}</p>}</li>)}</ol> : <EmptyState title="No entries yet" message={`Record ${item.name}'s mood, activity, or weight.`} />}</section>
  </div>;
}
