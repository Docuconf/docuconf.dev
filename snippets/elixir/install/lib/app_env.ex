# Compiles once the SDK is installed: the install check for the Get started page.
defmodule App.Env do
  use Docuconf, name: "app"

  env :port, :integer, description: "HTTP listen port", default: 8080, min: 1, max: 65535
end
