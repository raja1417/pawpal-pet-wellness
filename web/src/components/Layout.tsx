import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

export function Layout() {
  const { user, logout } = useAuth();
  return <div className="min-h-screen">
    <header className="border-b border-orange-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <NavLink to="/" className="text-2xl font-black text-coral" aria-label="PawPal home">🐾 PawPal</NavLink>
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-5">
          <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold text-coral' : 'hover:text-coral'}>Dashboard</NavLink>
          <NavLink to="/pets" className={({ isActive }) => isActive ? 'font-bold text-coral' : 'hover:text-coral'}>My pets</NavLink>
          <span className="hidden text-sm text-slate-500 sm:inline">Hi, {user?.name}</span>
          <button type="button" onClick={logout} className="btn-secondary !px-3 !py-1.5">Log out</button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500">PawPal offers tracking tools, not veterinary advice.</footer>
  </div>;
}
