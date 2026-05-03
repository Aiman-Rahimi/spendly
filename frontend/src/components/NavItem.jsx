import React from 'react';
import { Link, useLocation } from "react-router-dom";

const NavItem = ({ icon, text, to, initial }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 hover:bg-indigo-500 cursor-pointer ${
        isActive ? 'bg-indigo-700 rounded-md' : ''
      }`}
    >
      {icon ? (
        <div className="mr-3">{icon}</div>
      ) : (
        <div className="mr-3 w-6 h-6 bg-indigo-400 rounded-full text-sm flex items-center justify-center">
          {initial}
        </div>
      )}
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};

export default NavItem;
