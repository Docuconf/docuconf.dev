// Builds once the SDK is installed: the install check for the Get started page.
import Docuconf

struct AppConfig: DocuconfConfig {
    @Env("port", "HTTP listen port", .range(1...65535))
    var port = 8080
}

Docuconf.exportIfRequested(AppConfig.self, name: "app")
