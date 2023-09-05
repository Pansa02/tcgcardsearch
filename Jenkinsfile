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
                sh 'docker build -t pansa02/tcg_card_search:v${BUILD_NUMBER} .'
            }
        }

        stage('Login') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push') {
            steps {
                sh 'docker push pansa02/tcg_card_search:v${BUILD_NUMBER}'
            }
        }

        stage('Update latest image') {
            steps {
                sh 'docker tag push pansa02/tcg_card_search:v${BUILD_NUMBER} pansa02/tcg_card_search:latest'
                sh 'docker push pansa02/tcg_card_search:latest'
            }
        }

        stage('Clean') {
            steps {
                sh 'docker rmi pansa02/tcg_card_search:v${BUILD_NUMBER}'
            }
        }
    }
    post {
        always {
            sh 'docker logout'
        }
    }
}