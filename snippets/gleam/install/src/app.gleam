// Builds once the SDK is installed: the install check for the Get started page.
import docuconf
import gleam/io

pub fn main() {
  let spec = {
    use port <- docuconf.env(
      docuconf.int("PORT", "HTTP listen port")
      |> docuconf.min_int(1)
      |> docuconf.default(8080),
    )
    docuconf.succeed(port)
  }
  case docuconf.load(spec) {
    Ok(_) -> io.println("ok")
    Error(error) -> io.println(docuconf.describe(error))
  }
}
