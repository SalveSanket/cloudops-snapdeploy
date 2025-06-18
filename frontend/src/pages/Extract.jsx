// src/pages/Extract.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '../components/Alert';

const Extract = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('lambda');
  const [resourceName, setResourceName] = useState('');
  const [names, setNames] = useState([]);
  const [resourceDetails, setResourceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchNames = async () => {
      if (accountId && type) {
        try {
          const res = await axios.get(`${apiBaseUrl}/list-names`, {
            params: { account_id: accountId, type },
          });
          setNames(res.data.names);
        } catch (err) {
          console.error('Failed to load names:', err);
          setNames([]);
        }
      }
    };
    fetchNames();
  }, [accountId, type]);

  const handleExtract = async () => {
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await axios.get(`${apiBaseUrl}/extract/${type}`, {
        params: {
          account_id: accountId,
          name: resourceName,
        },
      });

      let normalizedDetails = {
        ...res.data,
        Functions: res.data.Functions || res.data.functions || []
      };

      if (type === 'lambda') {
        let foundFunction = null;
        const functionsArray = res.data.Functions || res.data.functions;
        if (Array.isArray(functionsArray)) {
          for (const regionBlock of functionsArray) {
            if (regionBlock.Functions && Array.isArray(regionBlock.Functions)) {
              const match = regionBlock.Functions.find(fn => fn.FunctionName === resourceName);
              if (match) {
                foundFunction = { ...match, Region: regionBlock.Region };
                break;
              }
            }
          }
        }
        normalizedDetails = {
          ...res.data,
          Functions: foundFunction || {},
        };
      }

      const count =
        normalizedDetails.Functions?.length ||
        normalizedDetails.functions?.length ||
        normalizedDetails.bots?.length ||
        normalizedDetails.instances?.length ||
        0;

      setResourceDetails(normalizedDetails);
      setAlert({ type: 'success', message: `✅ Extraction complete. Found ${count} items.` });
    } catch (err) {
      console.error('Error extracting:', err);
      setResourceDetails(null);
      setAlert({ type: 'error', message: '❌ Extraction failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnapshot = async () => {
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const res = await axios.post(`${apiBaseUrl}/snapshot`, {
        account_id: accountId,
        type,
        name: resourceName,
      });
      setAlert({ type: 'success', message: `✅ Snapshot created! S3 Path: ${res.data.s3_path}` });
    } catch (err) {
      console.error('Snapshot creation failed:', err);
      setAlert({ type: 'error', message: '❌ Snapshot creation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <style>{`
  .extract-page-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .extract-page-container h2 {
    font-size: 28px;
    font-weight: 600;
    color: #222;
    text-align: center;
    margin-bottom: 30px;
  }

  input, select {
    padding: 10px 12px;
    margin-bottom: 15px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    background-color: #fff;
    color: #222;
    width: 100%;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 10px;
  }

  .button-group button {
    padding: 10px 18px;
    font-size: 15px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .button-group button:hover {
    background-color: #0056b3;
  }

  .loading-container .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #FFD700;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    animation: spin 1s linear infinite;
    margin: auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  table {
    width: 100%;
    margin-top: 1rem;
    border-collapse: collapse;
    font-size: 14px;
  }

  table td, table th {
    padding: 12px 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  code {
    background-color: #eee;
    color: #000;
    padding: 2px 6px;
    border-radius: 4px;
  }

  ul {
    list-style: disc inside;
    padding-left: 1rem;
  }

  .resource-card {
    background: #fff;
    padding: 25px;
    margin-bottom: 30px;
    border-radius: 10px;
    color: #222;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .resource-card h3 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .highlight-title {
    color: #007bff;
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 10px;
  }

`}</style>
      <div className="extract-page-container layout-centered">
      <h2>🧪 Extract Resources</h2>
      <input placeholder="Account ID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="lambda">Lambda</option>
        <option value="lex">Lex</option>
        <option value="connect">Connect</option>
      </select>
      {names.length === 0 ? (
        <select disabled>
          <option value="">No {type} names found</option>
        </select>
      ) : (
        <select value={resourceName} onChange={(e) => setResourceName(e.target.value)}>
          <option value="">Select {type} Name</option>
          {names.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      )}
      <div className="button-group" style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <button onClick={handleExtract}>Extract</button>
        <button onClick={handleSnapshot}>Create Snapshot</button>
      </div>
      {loading && (
        <div className="loading-container" style={{ marginBottom: '1rem' }}>
          <div className="spinner" />
        </div>
      )}
      {alert.message && (
        <Alert type={alert.type} message={alert.message} />
      )}
      {resourceDetails && type === 'lambda' && Array.isArray(resourceDetails.Functions) && resourceDetails.Functions.length > 0 && (
        <div className="resource-card">
          <h3 className="highlight-title">📡 Live Lambda Resource State</h3>
          {resourceDetails.Functions.map((fn, idx) => (
            <div key={idx} className="resource-card" style={{marginBottom: '2rem'}}>
              <h3>📛 <strong>{fn.FunctionName}</strong></h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#222' }}>
                <tbody>
                  <tr><td>⚙️ Runtime</td><td>{fn.Runtime}</td></tr>
                  <tr><td>📂 Handler</td><td>{fn.Handler}</td></tr>
                  <tr><td>🧠 Memory</td><td>{fn.MemorySize} MB</td></tr>
                  <tr><td>⏱️ Timeout</td><td>{fn.Timeout} sec</td></tr>
                  <tr><td>📝 Description</td><td>{fn.Description || 'N/A'}</td></tr>
                  <tr>
                    <td>🌱 Env Vars</td>
                    <td>
                      {fn.Environment?.Variables ? (
                        <ul>
                          {Object.entries(fn.Environment.Variables).map(([k, v]) => (
                            <li key={k}><code>{k}</code>: <code>{v}</code></li>
                          ))}
                        </ul>
                      ) : 'None'}
                    </td>
                  </tr>
                  <tr><td>📍 Region</td><td>{fn.Region}</td></tr>
                  <tr><td>📅 Last Modified</td><td>{fn.LastModified}</td></tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      {resourceDetails && type === 'lambda' && Array.isArray(resourceDetails.Functions) && resourceDetails.Functions.length === 0 && (
        <p style={{ color: 'orange' }}>⚠️ No Lambda data found for this account/resource.</p>
      )}
      {resourceDetails && type === 'lambda' && resourceDetails.Functions && !Array.isArray(resourceDetails.Functions) && (
        <div className="resource-card">
          <h3 className="highlight-title">📡 Live Lambda Resource State</h3>
          <div>
            <h3>📛 <strong>{resourceDetails.Functions.FunctionName}</strong></h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#222' }}>
              <tbody>
                <tr><td>⚙️ Runtime</td><td>{resourceDetails.Functions.Runtime}</td></tr>
                <tr><td>📂 Handler</td><td>{resourceDetails.Functions.Handler}</td></tr>
                <tr><td>🧠 Memory</td><td>{resourceDetails.Functions.MemorySize} MB</td></tr>
                <tr><td>⏱️ Timeout</td><td>{resourceDetails.Functions.Timeout} sec</td></tr>
                <tr><td>📝 Description</td><td>{resourceDetails.Functions.Description || 'N/A'}</td></tr>
                <tr>
                  <td>🌱 Env Vars</td>
                  <td>
                    {resourceDetails.Functions.Environment?.Variables ? (
                      <ul>
                        {Object.entries(resourceDetails.Functions.Environment.Variables).map(([k, v]) => (
                          <li key={k}><code>{k}</code>: <code>{v}</code></li>
                        ))}
                      </ul>
                    ) : 'None'}
                  </td>
                </tr>
                <tr><td>📍 Region</td><td>{resourceDetails.Functions.Region}</td></tr>
                <tr><td>📅 Last Modified</td><td>{resourceDetails.Functions.LastModified}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {resourceDetails && (type === 'lex' || type === 'connect') && (
        <div className="resource-card">
          <h3 className="highlight-title">📡 Live {type.charAt(0).toUpperCase() + type.slice(1)} Resource State</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(resourceDetails).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 'bold', padding: '0.5rem', borderBottom: '1px solid #333' }}>{key}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #333' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </React.Fragment>
  );
};

export default Extract;
