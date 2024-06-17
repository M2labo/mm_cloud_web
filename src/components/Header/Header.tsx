import React from 'react';

export const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="logo">
        <h1 className="text-2xl">MM Cloud</h1>
      </div>
      <nav className="nav">
        <ul className="flex space-x-4">
          <li><a href="#map" className="hover:bg-gray-700 p-2 rounded">MAP</a></li>
          <li><a href="#calendar" className="hover:bg-gray-700 p-2 rounded">CALENDAR</a></li>
          <li><a href="#" className="hover:bg-gray-700 p-2 rounded">LOG</a></li>
          <li><a href="#analysis" className="hover:bg-gray-700 p-2 rounded">ANALYSIS</a></li>

        </ul>
      </nav>
    </header>
  );
};

