import Docuconf
import Testing
@testable import Orders

// LoadOptions(environment:) replaces the process environment, so a test passes exactly the variables it wants.
func load(_ environment: [String: String]) async throws -> OrdersConfig {
    try await Docuconf.load(OrdersConfig.self, options: LoadOptions(environment: environment))
}

@Test func defaults() async throws {
    let config = try await load(["DATABASE_URL": "postgres://orders@db/orders"])
    #expect(config.port == 8080)
    #expect(config.workerCount == 4)
}

@Test func rejectsBadValues() async throws {
    let error = await #expect(throws: ConfigurationError.self) { try await load(["PORT": "70000"]) }
    let found = error?.violations.map { "\($0.input) \($0.code.rawValue)" } ?? []
    #expect(found.contains("PORT out_of_range"))
    #expect(found.contains("DATABASE_URL missing_required"))
}
