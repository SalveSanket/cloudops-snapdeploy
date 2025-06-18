function Home() {
  return (
    <main className="main-content home-page" style={{ paddingTop: '80px', paddingBottom: '60px', minHeight: '100vh' }}>
      <div className="home-container">
        <h1 className="home-heading">🚀 Welcome to CloudOps SnapDeploy</h1>
        <section className="intro-card card">
          <h2>📘 Project Overview</h2>
          <p>
            CloudOps SnapDeploy is a unified DevOps automation platform designed to simplify the management of AWS Connect, Lambda, and Lex resources.
            With support for multi-account cross-environment deployments, it offers powerful snapshot, rollback, and deployment capabilities.
          </p>
        </section>

        <section className="features-card card">
          <h2>🎯 Key Features</h2>
          <ul>
            <li>🔁 Snapshot and rollback of AWS Lambda, Lex bots, and Connect flows</li>
            <li>🛠️ Cross-account deployment using secure role assumptions</li>
            <li>📦 Extract and view live AWS resource configuration</li>
            <li>🧪 Rollback automation with resource comparison</li>
            <li>🌐 Web-based interface with real-time visibility</li>
          </ul>
        </section>

        <section className="cta-card card">
          <h2>🔍 Get Started</h2>
          <p>
            Use the navigation above to add AWS accounts, extract configurations,
            create snapshots, and roll back to previous states. Every action is stored with metadata for auditability and security.
          </p>
        </section>
      </div>
      <style jsx>{`
        .home-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .home-heading {
          font-size: 32px;
          font-weight: 700;
          color: #222;
          text-align: center;
          margin-bottom: 40px;
        }

        .card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          padding: 25px 30px;
          margin-bottom: 35px;
        }

        .card h2 {
          font-size: 22px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .card p,
        .card li {
          font-size: 15px;
          color: #444;
          line-height: 1.6;
        }

        .card ul {
          padding-left: 20px;
          margin: 0;
        }

        .card li {
          margin-bottom: 8px;
        }
      `}</style>
    </main>
  );
}

export default Home;