CloudOps SnapDeploy

One-Click DevOps Automation Platform for Amazon Connect, Lex, and Lambda with Cross-Account CI/CD Support.

⸻

📌 Project Summary

CloudOps SnapDeploy is a production-grade web application that enables users to:
	•	Extract, Snapshot, Deploy, and Rollback AWS Lambda, Lex, and Connect configurations
	•	Manage multiple AWS accounts securely using DynamoDB and S3
	•	Perform cross-account operations via temporary credentials
	•	Support modular infrastructure and CI/CD automation using Docker, Jenkins, GitHub/Gitea

⸻

✅ Stage 1: Fully Functional Local Web Application

Backend (Flask + Boto3)

All API routes are implemented and functional:
	•	POST /accounts – Add an AWS account
	•	GET /accounts – List all added accounts
	•	DELETE /accounts/<id> – Remove an account
	•	GET /extract/<lambda|lex|connect> – Extract resources per region
	•	POST /snapshot – Take a snapshot of a specific resource
	•	GET /snapshots – List all snapshots for a specific resource
	•	POST /deploy – Deploy updated configurations to AWS
	•	POST /rollback – Rollback a resource using a snapshot

Snapshots are stored in an S3 bucket named per account: cloudops-snapshots-<account_id> under structured folders.

Frontend (React)

To be implemented:
	•	Account Management UI
	•	Lambda, Lex, Connect visual explorers
	•	Snapshot Viewer
	•	Deploy + Rollback panels
	•	API integration with Flask backend using Axios
	•	Tailwind CSS or Material UI

Local Development
	•	Flask backend runs on port 5050
	•	React frontend runs on port 3000
	•	.env used for secrets (NEVER hardcoded credentials)

⸻

🚀 Stage 2: DevOps, CI/CD, & Dockerization

Docker
	•	Dockerfile for Flask API
	•	Dockerfile for React frontend
	•	Docker Compose to run both locally

Jenkins + GitHub/Gitea CI/CD
	•	Jenkins pipeline will include:
	•	Code linting + tests
	•	SonarQube, Trivy, OWASP Dependency Check
	•	Docker image build and push
	•	GitOps deploy via Argo CD or Serverless framework

⸻

☁️ Stage 3: Cloud Deployment

Option A: AWS Lambda Hosting
	•	Flask backend deployed via Zappa or Serverless
	•	React frontend hosted on S3 + CloudFront

Option B: Kubernetes + Argo CD
	•	Cluster: Minikube (local) or EKS (cloud)
	•	GitOps with Argo CD
	•	Helm for templated deployments

⸻

🔄 Folder Structure for Snapshots in S3

<bucket-name>/
  <account_id>/
    <service_type>/
      <resource_name>/
        <service>_<resource_name>_snapshot_<timestamp>.json


⸻

📍 Current Status

Component	Status
Flask Backend	✅ Completed
Snapshot Logic	✅ Completed
Rollback Logic	✅ Completed
Deploy Logic	✅ Completed
AWS Lex/Connect	✅ Supported
S3 Storage	✅ Done
React Frontend	⏳ In Progress
Dockerization	⏳ Pending
Jenkins CI/CD	⏳ Pending
Lambda Hosting	⏳ Future


⸻

🧪 Testing

Test using curl or Postman with backend running locally:

curl -X GET http://localhost:5050/accounts


⸻

🧠 Contribution Plan
	•	Build working React UI next
	•	Finalize Docker setup
	•	Integrate Jenkins pipeline
	•	Choose deployment: Lambda or Kubernetes

⸻

📞 Contact

For issues, suggestions, or contributions, reach out to Sanket Salve.