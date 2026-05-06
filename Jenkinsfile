pipeline {
    agent any

        triggers {
            pollSCM('* * * * *') // cherche push toute les minutes
        }

    tools {
        maven 'MAVEN'
        jdk 'JDK17'
    }

    environment {
        MVN_OPTS = '-B'
        HOME = '/tmp/jenkins-home'

        DOCKER_REGISTRY = 'host.docker.internal:5001'
        NEXUS_CREDS_ID = 'nexus-creds'
        VERSION = "1.2.${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('BACKEND - Build, Test & Publish') {
                    steps {
                        script {
                            def services = ['user-service']

                            withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDS_ID,
                                             usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {

                                services.each { service ->
                                    echo "--- Publication Maven : ${service} ---"
                                    dir("backend/${service}") {
                                        // Maven voit NEXUS_USER et NEXUS_PASS car ils sont dans l'env du shell
                                        sh "mvn ${env.MVN_OPTS} clean deploy -s ../../settings.xml"
                                    }
                                }
                            }
                        }
                    }
                }

        // stage('Frontend - Build & Test') {
        //     steps {
        //         dir('frontend') {
        //             sh '''
        //                 export HOME=/tmp/jenkins-home
        //                 npm ci
        //                 npm test -- --watch=false --browsers=ChromeHeadlessCI --code-coverage --reporters=progress,coverage
        //             '''
        //         }
        //     }
        // }

        stage('DOCKER - Build & Push Multi-Services') {
            steps {
                script {
                    def services = ['media-service', 'order-service', 'product-service', 'user-service']

                    withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDS_ID, usernameVariable: 'USER', passwordVariable: 'PASS')]) {

                        sh "docker login ${env.DOCKER_REGISTRY} -u ${USER} -p ${PASS}"

                            services.each { service ->
                                echo "--- Publication de : ${service} (Version ${env.VERSION}) ---"

                                    dir("backend/${service}") {
                                        sh "docker build -t ${service}:${env.VERSION} ."
                                    }

                                    def remoteImage = "${env.DOCKER_REGISTRY}/${service}:${env.VERSION}"
                                    sh "docker tag ${service}:${env.VERSION} ${remoteImage}"
                                    sh "docker push ${remoteImage}"
                            }
                    }
                }
            }
        }

        // Stage SonarQube analysis is commented as it is not revelant for the Nexus project
        /* stage('SonarQube Full Analysis') {
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
        } */

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