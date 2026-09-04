import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { Pet } from '../types';

export function PetList() {
  const query = useQuery({ queryKey: ['pets'], queryFn: () => api<Pet[]>('/pets') });
  if (query.isLoading) return <Loading label="Finding your pets" />;
  if (query.error) return <ErrorState error={query.error} />;
  return <div><div className="mb-6 flex items-center justify-between"><h1 className="page-title">My pets</h1><Link to="/pets/new" className="btn">Add pet</Link></div>
    {!query.data?.length ? <EmptyState title="No pets yet" message="Create a profile for your companion." /> :
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.map((pet) => <article className="card" key={pet.id}>
        <img className="mb-4 aspect-video w-full rounded-xl bg-orange-50 object-cover" src={pet.photoUrl || 'https://placehold.co/600x400/fff1e6/8b5e3c?text=Pet'} alt={pet.photoUrl ? `${pet.name}` : ''} />
        <h2 className="text-2xl font-bold">{pet.name}</h2><p className="text-slate-500">{pet.species}{pet.breed && ` · ${pet.breed}`}</p>
        <p className="my-3 text-sm">{pet._count?.wellness ?? 0} wellness logs · {pet._count?.vaccinations ?? 0} vaccines</p><Link className="btn-secondary w-full" to={`/pets/${pet.id}`}>View profile</Link>
      </article>)}</div>}
  </div>;
}
