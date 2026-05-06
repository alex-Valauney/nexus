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


        stage('Build & Test') {
            steps {
                // On se déplace dans le sous-dossier avant de lancer Maven
                dir("${env.SERVICE_PATH}") {
                    echo "Compilation et Tests de user-service..."
                    // Le flag -Dsurefire.showSuccess=false permet de voir surtout les erreurs
                    sh 'mvn clean test -Dspring.data.mongodb.uri='
                    // sh 'mvn clean test -U'
                }
            }
        }

        stage('Publication Nexus') {
    steps {
        dir("${env.SERVICE_PATH}") {
            echo "Envoi de l'artefact vers Nexus..."
            withCredentials([usernamePassword(credentialsId: 'nexus-auth', passwordVariable: 'NEXUS_PASS', usernameVariable: 'NEXUS_USER')]) {
                // On injecte les credentials directement dans la commande Maven
                sh """
                mvn deploy -DskipTests \
                -DrepositoryId=nexus-snapshots \
                -Dusername=${NEXUS_USER} \
                -Dpassword=${NEXUS_PASS}
                """
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