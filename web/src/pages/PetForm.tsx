import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { ErrorState, Loading } from '../components/States';
import { Pet } from '../types';

export function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['pet', id], queryFn: () => api<Pet>(`/pets/${id}`), enabled: Boolean(id) });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: (data: object) => api<Pet>(id ? `/pets/${id}` : '/pets', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(data) }),
    onSuccess: async (pet) => { await client.invalidateQueries({ queryKey: ['pets'] }); navigate(`/pets/${pet.id}`); },
    onError: (err) => setError(err instanceof Error ? err.message : 'Unable to save pet')
  });
  useEffect(() => { setError(''); }, [id]);
  if (id && query.isLoading) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  const pet = query.data;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const weight = form.get('weight');
    mutation.mutate({
      name: form.get('name'), species: form.get('species'), breed: form.get('breed') || null,
      birthdate: form.get('birthdate') || null, photoUrl: form.get('photoUrl') || null,
      weight: weight ? Number(weight) : null
    });
  }
  return <div className="mx-auto max-w-2xl"><Link to={id ? `/pets/${id}` : '/pets'} className="text-sm font-semibold text-coral">← Back</Link><h1 className="page-title mt-3">{id ? `Edit ${pet?.name}` : 'Add a pet'}</h1>
    <form onSubmit={submit} className="card mt-6 grid gap-5 sm:grid-cols-2">
      {error && <p className="sm:col-span-2 text-red-700" role="alert">{error}</p>}
      <div><label htmlFor="pet-name">Name</label><input id="pet-name" name="name" required defaultValue={pet?.name} /></div>
      <div><label htmlFor="species">Species</label><select id="species" name="species" required defaultValue={pet?.species || ''}><option value="" disabled>Choose one</option><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
      <div><label htmlFor="breed">Breed (optional)</label><input id="breed" name="breed" defaultValue={pet?.breed || ''} /></div>
      <div><label htmlFor="birthdate">Birthdate (optional)</label><input id="birthdate" name="birthdate" type="date" defaultValue={pet?.birthdate?.slice(0, 10) || ''} /></div>
      <div><label htmlFor="weight">Current weight in kg</label><input id="weight" name="weight" type="number" min="0.01" max="1000" step="0.01" defaultValue={pet?.weight ?? ''} /></div>
      <div><label htmlFor="photoUrl">Photo URL (optional)</label><input id="photoUrl" name="photoUrl" type="url" defaultValue={pet?.photoUrl || ''} /></div>
      <div className="flex gap-3 sm:col-span-2"><button className="btn" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save pet'}</button><Link className="btn-secondary" to={id ? `/pets/${id}` : '/pets'}>Cancel</Link></div>
    </form>
  </div>;
}
