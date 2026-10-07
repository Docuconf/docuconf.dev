pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "app"

// Until the first release: build docuconf from a clone next to this project.
includeBuild("../docuconf-kotlin") {
    dependencySubstitution {
        substitute(module("dev.docuconf:docuconf-hoplite")).using(project(":docuconf-hoplite"))
    }
}
