pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('pansa02-dockerhub')
    }
    stages {
        // stage('Fetch Code') {
        //     steps {
        //         checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/Pansa02/tcgcardsearch.git']])
        //     }
        // }

        stage('Build Docker Image') {
            steps {
                sh 'sudo docker build -t pansa02/tcg-card-search:v${BUILD_NUMBER} .'
            }
        }

        stage('Login') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | sudo docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push') {
            steps {
                sh 'sudo docker push pansa02/tcg-card-search:v${BUILD_NUMBER}'
            }
        }

        stage('Update latest image') {
            steps {
                sh 'sudo docker tag pansa02/tcg-card-search:v${BUILD_NUMBER} pansa02/tcg-card-search:latest'
                sh 'sudo docker push pansa02/tcg-card-search:latest'
            }
        }

        stage('sed tcgApp.yml') {
            steps {
                sh "sed -i 's/latest/v${BUILD_NUMBER}/' tcgApp.yaml"
            }
        }

        stage('ansible') {
            steps {
                // sh 'ansible-playbook -i inventory tcgApp-playbook.yml'
                ansiblePlaybook becomeUser: 'ubuntu', credentialsId: 'kops-creds', installation: 'Ansible', inventory: 'inventory', playbook: 'tcgApp-playbook.yml', sudoUser: 'ubuntu'
            }
        }

        stage('Clean') {
            steps {
                sh 'sudo docker rmi pansa02/tcg-card-search:v${BUILD_NUMBER}'
                sh 'sudo docker rmi pansa02/tcg-card-search:latest'
            }
        }
    }
    post {
        always {
            sh 'docker logout'
            cleanWs(patterns: [[pattern: '**/tcgApp.yaml', type: 'INCLUDE']])
        }
    }
}