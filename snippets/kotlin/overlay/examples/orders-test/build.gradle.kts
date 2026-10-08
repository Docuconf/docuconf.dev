import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    kotlin("jvm") version "2.2.21"
    // Indexes the KDoc comments that describe some of the properties.
    id("dev.docuconf")
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
    implementation("dev.docuconf:docuconf-hoplite:0.1.0-SNAPSHOT")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

docuconf {
    configClass.set("dev.docuconf.examples.orders.OrdersConfig")
}
