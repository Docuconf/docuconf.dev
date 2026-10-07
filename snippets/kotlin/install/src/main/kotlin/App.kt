// Compiles once the SDK is installed: the install check for the Get started page.
import dev.docuconf.hoplite.Doc
import dev.docuconf.hoplite.Docuconf
import dev.docuconf.hoplite.Max
import dev.docuconf.hoplite.Min

data class AppConfig(@Doc("HTTP listen port") @Min(1) @Max(65535) val port: Int = 8080)

fun main() {
    println(Docuconf.exportCue(AppConfig::class, service = "app"))
}
