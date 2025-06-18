// src/pages/Snapshots.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Snapshots = () => {
  const [accountId, setAccountId] = useState('')
  const [type, setType] = useState('lambda')
  const [name, setName] = useState('')
  const [names, setNames] = useState([])
  const [snapshots, setSnapshots] = useState([])

  useEffect(() => {
    const fetchNames = async () => {
      if (accountId && type) {
        try {
          const res = await axios.get('http://localhost:5050/list-names', {
            params: { account_id: accountId, type }
          })
          setNames(res.data.names)
        } catch (err) {
          console.error('Failed to load names:', err)
          setNames([])
        }
      }
    }
    fetchNames()
  }, [accountId, type])

  const fetchSnapshots = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/snapshots`, {
        params: {
          account_id: accountId,
          type,
          name
        }
      })
      const parsed = res.data.snapshots.map(path => {
        const parts = path.split('/')
        const timestamp = parts[parts.length - 1]
          .replace(`${type}_${name}_snapshot_`, '')
          .replace('.json', '')
        return { timestamp, path }
      })
      setSnapshots(parsed)
    } catch (err) {
      console.error('Error fetching snapshots:', err)
      alert('Failed to fetch snapshots')
    }
  }

  const handleRollback = async (timestamp) => {
    try {
      await axios.post('http://localhost:5050/rollback', {
        account_id: accountId,
        type,
        name,
        timestamp
      })
      alert('Rollback triggered successfully')
    } catch (err) {
      console.error('Error during rollback:', err)
      alert('Failed to rollback')
    }
  }

  return (
    <main className="main-content snapshots-page">
      <div className="snapshots-container">
        <h2 className="section-title">📸 Snapshot Viewer & Rollback</h2>

        <div className="snapshot-form card">
          <div className="form-grid">
            <input
              placeholder="Account ID"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="form-input"
            />
            <select value={type} onChange={e => setType(e.target.value)} className="form-input">
              <option value="lambda">Lambda</option>
              <option value="lex">Lex</option>
              <option value="connect">Connect</option>
            </select>
            {names.length === 0 ? (
              <select disabled className="form-input">
                <option>No {type} names found</option>
              </select>
            ) : (
              <select value={name} onChange={e => setName(e.target.value)} className="form-input">
                <option value="">Select {type} Name</option>
                {names.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            )}
            <button onClick={fetchSnapshots} className="form-button">Load Snapshots</button>
          </div>
        </div>

        <section className="snapshot-list card">
          {snapshots.length === 0 ? (
            <div>No snapshots found.</div>
          ) : (
            <table className="snapshot-table">
              <thead>
                <tr>
                  <th>⏱️ Timestamp</th>
                  <th>📂 S3 Path</th>
                  <th>🛠️ Action</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map(snap => (
                  <tr key={snap.timestamp}>
                    <td>{snap.timestamp}</td>
                    <td className="truncate">{snap.path}</td>
                    <td>
                      <button
                        onClick={() => handleRollback(snap.timestamp)}
                        className="rollback-button"
                      >
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <style jsx>{`
        .main-content.snapshots-page {
          padding-top: 80px;
          padding-bottom: 60px;
          min-height: 100vh;
          background: #f6f8fa;
        }
        .snapshots-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .section-title {
          text-align: center;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 30px;
        }
        .card {
          color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          padding: 25px;
          margin-bottom: 40px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
        }
        .form-input {
          padding: 10px 12px;
          background-color:rgb(255, 255, 255);
          color:rgb(0, 0, 0);
          border: 1px solid #444;
          border-radius: 6px;
          font-size: 14px;
        }
        .form-input::placeholder {
          color: #ccc;
        }
        .form-button {
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
        .snapshot-table {
          width: 100%;
          background: #1f1f1f;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .snapshot-table th,
        .snapshot-table td {
          padding: 12px 10px;
          text-align: left;
          border-bottom: 1px solid #444;
          color: #ffffff;
        }
        .snapshot-table th {
          background-color: #333;
          font-weight: 600;
        }
        .rollback-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
        }
        .rollback-button:hover {
          background-color: #218838;
        }
        .truncate {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #ffffff;
        }
      `}</style>
    </main>
  )
}

export default Snapshots