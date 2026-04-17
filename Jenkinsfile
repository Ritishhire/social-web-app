pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/Ritishhire/social-web-app.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage("Trivy Scan"){
            steps{
                    sh "trivy image -f table -o backend-report.txt socialapp-backend:latest"
                    sh "trivy image -f table -o frontend-report.txt socialapp-frontend:latest"
            }
        }
        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "DockerHub",
                    usernameVariable: "dockerHubUser",
                    passwordVariable: "dockerHubPass"
                )]) {

                    sh "docker login -u $dockerHubUser -p $dockerHubPass"

                    sh "docker tag socialapp-backend:latest $dockerHubUser/socialapp-backend:latest"
                    sh "docker tag socialapp-frontend:latest $dockerHubUser/socialapp-frontend:latest"

                    sh "docker push $dockerHubUser/socialapp-backend:latest"
                    sh "docker push $dockerHubUser/socialapp-frontend:latest"
                }
            }
        }

        stage("Deploy"){
            steps{
                sh 'docker-compose down'
                sh 'docker-compose pull'
                sh 'docker-compose up -d'
            }
        }

        stage("Test"){
            steps{
                sh 'docker ps'
                sh 'curl http://localhost:5000 || true'
                sh 'curl http://localhost:3000 || true'
            }
        }
    }
}
