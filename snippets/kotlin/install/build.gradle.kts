plugins {
    kotlin("jvm") version "2.2.21"
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation("dev.docuconf:docuconf-hoplite:0.1.0")
}
