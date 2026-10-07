// The orders example's sources, built with kotlin("test") for the site's test.
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

rootProject.name = "orders-test"

includeBuild("../..") {
    dependencySubstitution {
        substitute(module("dev.docuconf:docuconf-hoplite")).using(project(":docuconf-hoplite"))
    }
}
