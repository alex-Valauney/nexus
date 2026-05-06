pipeline {
    agent any

    tools {
        maven 'MAVEN' // Le nom que tu as donné dans la config
    }

    options {
        // Évite de remplir le disque avec 1000 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        // Trigger via Webhook recommandé (GitHub/GitLab)
        pollSCM('* * * * *')
    }

    environment {
        SERVICE_PATH = "backend/user-service"
        NEXUS_CREDS  = credentials('nexus-auth')
    }

    stages {
        // stage('Détection des changements') {
        //     steps {
        //         script {
        //             // On vérifie si des modifications ont eu lieu dans le dossier spécifique
        //             // Si ce n'est pas le cas, on peut arrêter le build tôt (optionnel)
        //             def changedFiles = sh(script: "git diff --name-only ${env.GIT_PREVIOUS_COMMIT} ${env.GIT_COMMIT}", returnStdout: true).trim()
        //             if (!changedFiles.contains(env.SERVICE_PATH)) {
        //                 echo "Aucun changement détecté dans ${env.SERVICE_PATH}. Arrêt du pipeline."
        //                 currentBuild.result = 'SUCCESS'
        //                 return
        //             }
        //         }
        //     }
        // }

        stage('Tests') {
            agent {
                docker { 
                    image 'maven:3.9-eclipse-temurin-17'
                    // On lance un container mongo lié au build
                    args '--link my-mongo-db:mongodb' 
                }
            }
            steps {
                dir("${env.SERVICE_PATH}") {
                    // On définit l'URL de la DB pour les tests
                    sh 'mvn test -Dspring.data.mongodb.uri=mongodb://mongodb:27017/testdb'
                }
            }
        }

        stage('Build & Test') {
            steps {
                // On se déplace dans le sous-dossier avant de lancer Maven
                dir("${env.SERVICE_PATH}") {
                    echo "Compilation et Tests de user-service..."
                    sh 'mvn clean test'
                }
            }
        }

        stage('Publication Nexus') {
            steps {
                dir("${env.SERVICE_PATH}") {
                    echo "Envoi de l'artefact vers Nexus..."
                    // Utilisation des credentials pour s'authentifier
                    withCredentials([usernamePassword(credentialsId: 'nexus-auth', passwordVariable: 'NEXUS_PASS', usernameVariable: 'NEXUS_USER')]) {
                        sh 'mvn deploy -DskipTests'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs() // Nettoie l'espace de travail après le build
        }
    }
}