// The orders example's sources, built with kotlin("test") for the site's test.
pluginManagement {
    includeBuild("../../docuconf-gradle-plugin")
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
includeBuild("../..")

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "orders-test"
