pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    S3_UI_BUCKET = 'cloudops-frontend-snapdeploy'
    SAM_BUCKET = 'cloudops-sam-deploy-bucket'
    STACK_NAME = 'cloudops-snapdeploy'
  }

  options {
    timestamps()
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          echo '📦 Installing frontend dependencies...'
          sh 'npm ci'
          echo '⚙️ Building React frontend...'
          sh 'npm run build'
        }
      }
    }

    stage('Deploy Frontend to S3') {
      steps {
        withAWS(credentials: 'AWS Jenkins Credentials', region: "${env.AWS_REGION}") {
          echo '☁️ Syncing frontend build to S3...'
          sh 'aws s3 sync frontend/dist/ s3://$S3_UI_BUCKET --delete'
        }
      }
    }

    stage('Build and Deploy Backend (SAM)') {
      steps {
        dir('backend') {
          withAWS(credentials: 'AWS Jenkins Credentials', region: "${env.AWS_REGION}") {
            echo '🔧 Building backend using SAM...'
            sh 'sam build'

            echo '🚀 Deploying backend to Lambda using SAM...'
            sh """
              sam deploy \
                --stack-name $STACK_NAME \
                --s3-bucket $SAM_BUCKET \
                --region $AWS_REGION \
                --capabilities CAPABILITY_IAM \
                --no-confirm-changeset
            """
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deployment completed successfully!'
    }
    failure {
      echo '❌ Deployment failed. Check logs above.'
    }
  }
}