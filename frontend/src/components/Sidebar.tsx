import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/validation', label: 'Validación' },
  { to: '/subscribers', label: 'Suscriptores' },
  { to: '/logs', label: 'Logs' },
  { to: '/runs', label: 'Ejecuciones' },
];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand">L5G</div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
