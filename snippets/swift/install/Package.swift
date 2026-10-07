// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "App",
    platforms: [.macOS(.v15)],
    dependencies: [
        // Until the first release, from the main branch:
        .package(url: "https://github.com/Docuconf/docuconf-swift", branch: "main"),
    ],
    targets: [
        .executableTarget(
            name: "App",
            dependencies: [.product(name: "Docuconf", package: "docuconf-swift")]
        ),
    ]
)
