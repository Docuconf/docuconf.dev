defmodule App.MixProject do
  use Mix.Project

  def project do
    [app: :app, version: "0.1.0", elixir: "~> 1.18", deps: deps()]
  end

  defp deps do
    [
      # Until the first release, from the main branch:
      {:docuconf, github: "Docuconf/docuconf-elixir", branch: "main"}
    ]
  end
end
