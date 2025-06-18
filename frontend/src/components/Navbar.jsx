import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const navStyle = {
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor : 'rgb(255, 255, 255)',
    zIndex: 1000,
  }

  const ulStyle = {
    display: 'flex',
    gap: '2rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }

  return (
    <div style={navStyle}>
      <nav>
        <ul style={ulStyle}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/accounts">Accounts</Link></li>
          <li><Link to="/extract">Extract</Link></li>
          <li><Link to="/snapshots">Snapshots</Link></li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar