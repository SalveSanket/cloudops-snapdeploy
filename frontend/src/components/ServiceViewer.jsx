import React from 'react';

function ServiceViewer({ title, items, service }) {
  if (!items || items.length === 0) {
    return <p>No {title} found.</p>;
  }

  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {service === 'lambda' && (
              <>
                <strong>{item.FunctionName}</strong> — {item.Runtime}
                <br />Last Modified: {item.LastModified}
              </>
            )}
            {service === 'lex' && (
              <>
                <strong>{item.botName}</strong> — Status: {item.botStatus}
              </>
            )}
            {service === 'connect' && (
              <>
                <strong>{item.InstanceAlias}</strong> — ID: {item.Id}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceViewer;