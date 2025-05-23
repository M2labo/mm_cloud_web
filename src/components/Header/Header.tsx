import React, { useState } from 'react';
import {useAuthenticator} from "@aws-amplify/ui-react";

export const Header = () => {
  const {signOut} = useAuthenticator()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="logo">
        <h1 className="text-2xl">MM Cloud</h1>
      </div>
      <nav className="nav">
        <button 
          className="block md:hidden p-2 rounded focus:outline-none focus:bg-gray-700"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        {/* サイドメニュー */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-gray-800 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}
          style={{ zIndex: 9000 }}
        >
          <button 
            className="p-2 text-white focus:outline-none"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <ul className="mt-8 space-y-4">
            <li><a href="#" className="block p-4 text-white hover:bg-gray-700">MAP</a></li>
            <li><a href="#calendar" className="block p-4 text-white hover:bg-gray-700">CALENDAR</a></li>
            <li><a href="#log" className="block p-4 text-white hover:bg-gray-700">LOG</a></li>
            <li><a href="#analysis" className="block p-4 text-white hover:bg-gray-700">ANALYSIS</a></li>
            <li><a href="#setting" className="block p-4 text-white hover:bg-gray-700">SETTING</a></li>
            {/* <li><a href="#chat" className="block p-4 text-white hover:bg-gray-700">CHAT</a></li> */}
            <li>
              <button onClick={signOut} className="block p-4 text-white hover:bg-gray-700 w-full text-left">
                SIGN OUT
              </button>
            </li>
          </ul>
        </div>
      </nav>
      {/* デスクトップナビゲーション */}
      <ul className="hidden md:flex space-x-4">
        <li><a href="#" className="hover:bg-gray-700 p-2 rounded text-white inline-block">MAP</a></li>
        <li><a href="#calendar" className="hover:bg-gray-700 p-2 rounded text-white inline-block">CALENDAR</a></li>
        <li><a href="#log" className="hover:bg-gray-700 p-2 rounded text-white inline-block">LOG</a></li>
        <li><a href="#analysis" className="hover:bg-gray-700 p-2 rounded text-white inline-block">ANALYSIS</a></li>
        <li><a href="#setting" className="hover:bg-gray-700 p-2 rounded text-white inline-block">SETTING</a></li>
        {/* <li><a href="#chat" className="hover:bg-gray-700 p-2 rounded text-white inline-block">CHAT</a></li> */}
        <li>
          <button
            onClick={signOut}
            className="hover:bg-gray-700 p-2 rounded text-white inline-block"
          >
            SIGN OUT
          </button>
        </li>
      </ul>
    </header>
  );
};
