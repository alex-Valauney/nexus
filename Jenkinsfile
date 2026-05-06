pipeline {
    agent any

        triggers {
            pollSCM('* * * * *') // cherche push toute les minutes
        }

    tools {
        maven 'MAVEN'
        jdk 'JDK17'
        nodejs 'node18'
    }

    environment {
        MVN_OPTS = '-B'
        HOME = '/tmp/jenkins-home'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('BACKEND - Build & Test') {
            steps {
                sh "mvn ${env.MVN_OPTS} clean verify dependency:copy-dependencies"
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: '**/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend - Build & Test') {
            steps {
                dir('frontend') {
                    sh '''
                        export HOME=/tmp/jenkins-home
                        npm ci
                        npm test -- --watch=false --browsers=ChromeHeadlessCI --code-coverage --reporters=progress,coverage
                    '''
                }
            }
        }

        stage('SonarQube Full Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') { 
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
                timeout(time: 10, unit: 'MINUTES') { 
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deployment') {
            steps {
                script {
                    try {
                        sh '''
                            echo "=== Déploiement ==="
                            docker-compose down
                            docker-compose up -d --build
                        '''

                    } catch (err) {
                        echo "Déploiement échoué"
                        if (fileExists('docker-compose.yml')) {
                            sh 'docker-compose up -d'
                        }
                        throw err
                    }
                }
            }
        }
    }

    post {
        success {
                echo "✅ Build réussi!"
            }

        failure {
            echo "❌ Build échoué!"
        }
    }
}