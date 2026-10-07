// Builds once the SDK is installed: the install check for the Get started page.
use docuconf::Docuconf;
use serde::Deserialize;

#[derive(Debug, Deserialize, Docuconf)]
struct Config {
    /// HTTP listen port.
    #[docuconf(default = 8080, min = 1)]
    port: u16,
}

fn main() {
    let config: Config = docuconf::load().unwrap_or_else(|e| panic!("{e}"));
    println!("{}", config.port);
}
