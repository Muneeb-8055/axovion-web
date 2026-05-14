import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
};
