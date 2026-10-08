// Until the first release: build docuconf and its Gradle plugin from a clone next to this project.
pluginManagement {
    includeBuild("../docuconf-kotlin/docuconf-gradle-plugin")
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
includeBuild("../docuconf-kotlin")

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "app"
