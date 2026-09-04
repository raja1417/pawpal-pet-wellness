import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { Pet, Reminders } from '../types';

export function Dashboard() {
  const pets = useQuery({ queryKey: ['pets'], queryFn: () => api<Pet[]>('/pets') });
  const reminders = useQuery({ queryKey: ['reminders'], queryFn: () => api<Reminders>('/reminders') });
  if (pets.isLoading || reminders.isLoading) return <Loading label="Preparing your dashboard" />;
  if (pets.error || reminders.error) return <ErrorState error={pets.error || reminders.error} />;
  if (!pets.data?.length) return <><h1 className="page-title mb-6">Your wellness dashboard</h1><EmptyState title="Meet your first pet" message="Add a profile to start tracking everyday wellness." action={<Link to="/pets/new" className="btn">Add a pet</Link>} /></>;
  const activity = pets.data.reduce((sum, pet) => sum + (pet.wellness?.[0]?.activityMinutes ?? 0), 0);
  const trend = (pets.data[0].wellness || []).filter((entry) => entry.weight != null).slice().reverse().map((entry) => ({
    date: new Date(entry.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: entry.weight
  }));
  const items = [
    ...(reminders.data?.vaccinations ?? []).map((item) => ({ id: item.id, pet: item.pet, name: item.name, date: item.dueDate, overdue: item.overdue })),
    ...(reminders.data?.vetVisits ?? []).map((item) => ({ id: item.id, pet: item.pet, name: item.reason, date: item.visitDate, overdue: item.overdue }))
  ].sort((a, b) => a.date.localeCompare(b.date));
  return <div className="space-y-8">
    <div><p className="font-semibold text-coral">Today at a glance</p><h1 className="page-title">Your wellness dashboard</h1></div>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Activity summary">
      <div className="card"><p className="text-sm text-slate-500">Pets</p><p className="text-3xl font-bold">{pets.data.length}</p></div>
      <div className="card"><p className="text-sm text-slate-500">Latest logged activity</p><p className="text-3xl font-bold">{activity} <span className="text-base">min</span></p></div>
      <div className="card"><p className="text-sm text-slate-500">Care reminders</p><p className="text-3xl font-bold">{items.length}</p></div>
    </section>
    <section className="card"><h2 className="text-2xl font-bold">{pets.data[0].name}'s weight trend</h2><p className="mb-4 text-sm text-slate-500">Recent wellness entries</p>
      {trend.length ? <div className="h-56" aria-label={`${pets.data[0].name} weight trend chart`}><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={['auto', 'auto']} unit=" kg" width={60} /><Tooltip /><Line type="monotone" dataKey="weight" stroke="#df6d5b" strokeWidth={3} /></LineChart></ResponsiveContainer></div> : <p className="text-slate-500">Log a weight to start this trend.</p>}
    </section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Your companions</h2><Link className="btn-secondary" to="/pets/new">Add pet</Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{pets.data.map((pet) => <Link to={`/pets/${pet.id}`} className="card group" key={pet.id}>
        <div className="flex items-center gap-4"><img className="h-16 w-16 rounded-full bg-orange-50 object-cover" src={pet.photoUrl || 'https://placehold.co/128x128/fff1e6/8b5e3c?text=Pet'} alt="" /><div><h3 className="text-xl font-bold group-hover:text-coral">{pet.name}</h3><p className="text-slate-500">{pet.breed || pet.species}</p><p className="text-sm">{pet.weight ? `${pet.weight} kg` : 'No weight yet'}</p></div></div>
      </Link>)}</div>
    </section>
    <section><h2 className="mb-4 text-2xl font-bold">Coming up</h2>{items.length ? <ul className="card divide-y">{items.slice(0, 6).map((item) =>
      <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0" key={`${item.name}-${item.id}`}><div><Link to={`/pets/${item.pet.id}/vaccinations`} className="font-bold hover:text-coral">{item.name}</Link><p className="text-sm text-slate-500">{item.pet.name}</p></div><time className={item.overdue ? 'font-semibold text-red-600' : ''}>{item.overdue ? 'Overdue · ' : ''}{new Date(item.date).toLocaleDateString()}</time></li>
    )}</ul> : <EmptyState title="Nothing due soon" message="Your next 60 days are clear." />}</section>
  </div>;
}
