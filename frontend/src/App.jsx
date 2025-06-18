// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Accounts from './pages/Accounts'
import Extract from './pages/Extract'
import Snapshots from './pages/Snapshots'

function App() {
  return (
    <div className="app-wrapper" style={{
      backgroundColor: '#f8f9fa', // Light background for the app
      minHeight: '100vh', // Ensure the app takes up at least the full viewport height
      paddingBottom: '60px' // Reserve space for the fixed footer
    }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '4rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/snapshots" element={<Snapshots />} />
        </Routes>
      </main>

      <Footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTop: '1px solid #ccc',
        textAlign: 'center',
        padding: '10px 0'
      }} />
    </div>
  )
}

export default App