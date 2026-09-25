import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import Home from './pages/Dashboard';
import Market from './pages/Market';
import Voice from './pages/Voice';
import Scanner from './pages/Scanner';
import Helpline from './pages/Helpline';
import Farm from './pages/Farm';
import Monitoring from './pages/Monitoring';
import Advisory from './pages/Advisory';
import Ledger from './pages/Ledger';
import Credits from './pages/Credits';
import Network from './pages/Network';
import Analytics from './pages/Analytics';
import Offline from './pages/Offline';
import { Toaster } from './components/ui/sonner';
import './App.css';
import './ecosystem.css';

export default function App() {
  return <BrowserRouter><AppProvider><Layout><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/market" element={<Market />} />
    <Route path="/voice" element={<Voice />} />
    <Route path="/scanner" element={<Scanner />} />
    <Route path="/helpline" element={<Helpline />} />
    <Route path="/farm" element={<Farm />} />
    <Route path="/monitoring" element={<Monitoring />} />
    <Route path="/advisory" element={<Advisory />} />
    <Route path="/ledger" element={<Ledger />} />
    <Route path="/credits" element={<Credits />} />
    <Route path="/network" element={<Network />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/offline" element={<Offline />} />
    <Route path="*" element={<Home />} />
  </Routes></Layout><Toaster position="top-center" richColors /></AppProvider></BrowserRouter>;
}