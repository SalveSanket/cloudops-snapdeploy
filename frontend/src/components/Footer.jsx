import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'rgb(255, 255, 255)',
      color: 'rgba(0, 0, 0, 0.7)',
      padding: '1rem',
      textAlign: 'center',
      fontSize: '0.9rem',
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      zIndex: 999
    }}>
      © {new Date().getFullYear()} CloudOps SnapDeploy — All Rights Reserved.
    </footer>
  );
};

export default Footer;