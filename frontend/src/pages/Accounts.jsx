// src/pages/Accounts.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [formData, setFormData] = useState({
    account_id: '',
    access_key_id: '',
    secret_access_key: '',
    region: '',
    friendly_name: ''
  })
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('http://localhost:5050/accounts')
      const data = res.data
      setAccounts(Array.isArray(data) ? data : data.accounts)
    } catch (err) {
      console.error('Error fetching accounts:', err)
      alert('Failed to fetch accounts — check backend is running and CORS is OK')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5050/accounts', formData)
      fetchAccounts()
      setFormData({
        account_id: '',
        access_key_id: '',
        secret_access_key: '',
        region: '',
        friendly_name: ''
      })
    } catch (err) {
      console.error('Error adding account:', err)
    }
  }

  const handleDelete = async accountId => {
    try {
      await axios.delete(`http://localhost:5050/accounts/${accountId}`)
      fetchAccounts()
    } catch (err) {
      console.error('Error deleting account:', err)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <main className="main-content accounts-page" style={{ paddingTop: '80px', paddingBottom: '60px', minHeight: '100vh' }}>
      <div className="accounts-container">
        <div className="heading-wrapper">
          <h2>🧾 Manage AWS Accounts</h2>
        </div>

        <section className="account-form-section card">
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-grid">
              <input name="account_id" placeholder="Account ID" value={formData.account_id} onChange={handleInputChange} required className="form-input" />
              <input name="access_key_id" placeholder="Access Key ID" value={formData.access_key_id} onChange={handleInputChange} required className="form-input" />
              <input name="secret_access_key" placeholder="Secret Access Key" value={formData.secret_access_key} onChange={handleInputChange} required className="form-input" />
              <input name="region" placeholder="Region" value={formData.region} onChange={handleInputChange} required className="form-input" />
              <input name="friendly_name" placeholder="Friendly Name" value={formData.friendly_name} onChange={handleInputChange} required className="form-input" />
            </div>
            <button type="submit" className="form-button">Add Account</button>
          </form>
        </section>

        <section className="account-list-section card">
          <hr />
          {loading ? (
            <div className="loading-spinner"></div>
          ) : accounts.length === 0 ? (
            <div>No accounts found. Add one to get started.</div>
          ) : (
            <table className="account-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Region</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.account_id}>
                    <td>{acc.account_id}</td>
                    <td>{acc.region}</td>
                    <td>{acc.friendly_name}</td>
                    <td>
                      <button onClick={() => handleDelete(acc.account_id)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      <style jsx>{`
        .accounts-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #222;
        }

        .heading-wrapper h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          text-align: center;
          margin-bottom: 30px;
        }

        .card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          padding: 25px;
          margin-bottom: 40px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 15px;
          color: #111;
          background-color: #f8f8f8;
        }

        .form-button {
          margin-top: 20px;
          background-color: #007bff;
          color: #fff;
          padding: 10px 18px;
          font-size: 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .form-button:hover {
          background-color: #0056b3;
        }

        .account-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .account-table th,
        .account-table td {
          padding: 12px 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
          color: #333;
        }

        .account-table th {
          background-color: #f2f2f2;
          font-weight: 600;
          color: #000;
        }

        .delete-button {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
        }

        .delete-button:hover {
          background-color: #c82333;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin: 30px auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  )
}

export default Accounts