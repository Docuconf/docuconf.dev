import Docuconf
import Testing
@testable import Orders

// load(_:environment:) reads only this dictionary: never the process environment, and no termination log.
func load(_ environment: [String: String]) async throws -> OrdersConfig {
    try await Docuconf.load(OrdersConfig.self, environment: environment)
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
