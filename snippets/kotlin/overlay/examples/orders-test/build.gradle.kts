import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    kotlin("jvm") version "2.2.21"
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
    sourceSets["main"].kotlin.srcDir("../orders/src/main/kotlin")
}

dependencies {
    implementation("dev.docuconf:docuconf-hoplite:0.1.0")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
