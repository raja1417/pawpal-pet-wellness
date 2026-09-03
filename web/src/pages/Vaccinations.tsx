import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { Pet, Vaccination, VetVisit } from '../types';

export function Vaccinations() {
  const { id } = useParams();
  const client = useQueryClient();
  const [error, setError] = useState('');
  const pet = useQuery({ queryKey: ['pet', id], queryFn: () => api<Pet>(`/pets/${id}`) });
  const create = useMutation({
    mutationFn: (data: object) => api(`/pets/${id}/vaccinations`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ['pet', id] }), client.invalidateQueries({ queryKey: ['reminders'] })]);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Unable to add vaccination')
  });
  const complete = useMutation({
    mutationFn: (vaccination: Vaccination) => api(`/pets/${id}/vaccinations/${vaccination.id}`, { method: 'PATCH', body: JSON.stringify({ completedAt: vaccination.completedAt ? null : new Date().toISOString().slice(0, 10) }) }),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ['pet', id] }), client.invalidateQueries({ queryKey: ['reminders'] }), client.invalidateQueries({ queryKey: ['tips', id] })]); }
  });
  const createVisit = useMutation({
    mutationFn: (data: object) => api(`/pets/${id}/vet-visits`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ['pet', id] }), client.invalidateQueries({ queryKey: ['reminders'] })]); },
    onError: (err) => setError(err instanceof Error ? err.message : 'Unable to schedule visit')
  });
  const completeVisit = useMutation({
    mutationFn: (visit: VetVisit) => api(`/pets/${id}/vet-visits/${visit.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !visit.completed }) }),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ['pet', id] }), client.invalidateQueries({ queryKey: ['reminders'] })]); }
  });
  if (pet.isLoading) return <Loading />;
  if (pet.error) return <ErrorState error={pet.error} />;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({ name: form.get('name'), dueDate: form.get('dueDate'), notes: form.get('notes') || null });
    event.currentTarget.reset();
  }
  function submitVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createVisit.mutate({
      reason: form.get('reason'),
      visitDate: new Date(String(form.get('visitDate'))).toISOString(),
      notes: form.get('notes') || null
    });
    event.currentTarget.reset();
  }
  return <div className="space-y-7"><div><Link to={`/pets/${id}`} className="text-sm font-semibold text-coral">← {pet.data?.name}'s profile</Link><h1 className="page-title mt-3">Vaccinations</h1></div>
    <div className="grid items-start gap-7 lg:grid-cols-2"><section><h2 className="mb-4 text-xl font-bold">Tracker</h2>{pet.data?.vaccinations?.length ? <ul className="space-y-3">{pet.data.vaccinations.map((vaccination) => {
      const overdue = !vaccination.completedAt && new Date(vaccination.dueDate) < new Date();
      return <li className="card flex items-center justify-between gap-4" key={vaccination.id}><div><h3 className="font-bold">{vaccination.name}</h3><p className={overdue ? 'text-sm font-semibold text-red-600' : 'text-sm text-slate-500'}>{vaccination.completedAt ? `Completed ${new Date(vaccination.completedAt).toLocaleDateString()}` : `${overdue ? 'Overdue' : 'Due'} ${new Date(vaccination.dueDate).toLocaleDateString()}`}</p>{vaccination.notes && <p className="mt-1 text-sm">{vaccination.notes}</p>}</div><button className="btn-secondary shrink-0" onClick={() => complete.mutate(vaccination)} disabled={complete.isPending}>{vaccination.completedAt ? 'Reopen' : 'Mark done'}</button></li>;
    })}</ul> : <EmptyState title="No vaccinations" message="Add the next due date to receive reminders." />}</section>
      <section className="card"><h2 className="mb-4 text-xl font-bold">Add vaccination</h2>{error && <p role="alert" className="mb-3 text-red-700">{error}</p>}<form className="space-y-4" onSubmit={submit}><div><label htmlFor="vaccine-name">Vaccine name</label><input id="vaccine-name" name="name" required /></div><div><label htmlFor="dueDate">Due date</label><input id="dueDate" name="dueDate" type="date" required /></div><div><label htmlFor="vaccine-notes">Notes</label><textarea id="vaccine-notes" name="notes" rows={3} /></div><button className="btn w-full" disabled={create.isPending}>Add vaccination</button></form></section>
    </div>
    <section><h2 className="mb-4 text-2xl font-bold">Vet visits</h2><div className="grid items-start gap-7 lg:grid-cols-2">
      <div>{pet.data?.vetVisits?.length ? <ul className="space-y-3">{pet.data.vetVisits.map((visit) => <li className="card flex items-center justify-between gap-4" key={visit.id}><div><h3 className="font-bold">{visit.reason}</h3><time className="text-sm text-slate-500">{new Date(visit.visitDate).toLocaleString()}</time></div><button className="btn-secondary" onClick={() => completeVisit.mutate(visit)} disabled={completeVisit.isPending}>{visit.completed ? 'Reopen' : 'Mark done'}</button></li>)}</ul> : <EmptyState title="No vet visits" message="Schedule the next checkup or appointment." />}</div>
      <form className="card space-y-4" onSubmit={submitVisit}><h3 className="text-xl font-bold">Schedule a visit</h3><div><label htmlFor="visit-reason">Reason</label><input id="visit-reason" name="reason" required /></div><div><label htmlFor="visit-date">Date and time</label><input id="visit-date" name="visitDate" type="datetime-local" required /></div><div><label htmlFor="visit-notes">Notes</label><textarea id="visit-notes" name="notes" rows={3} /></div><button className="btn w-full" disabled={createVisit.isPending}>Schedule visit</button></form>
    </div></section>
  </div>;
}
