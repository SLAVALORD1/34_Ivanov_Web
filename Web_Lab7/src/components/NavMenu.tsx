import { NavLink } from 'react-router-dom';

export const NavMenu = () => {
  const pages = [
    { path: '/', label: 'Случайный пёс' },
    { path: '/breeds', label: 'Все породы' },
    { path: '/my', label: 'Моя коллекция' },
    { path: '/facts', label: 'Факты о котах' },
  ];

  return (
    <div className="nav-menu">
      {pages.map((page) => (
        <NavLink
          key={page.path}
          to={page.path}
          className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}
        >
          {page.label}
        </NavLink>
      ))}
    </div>
  );
};