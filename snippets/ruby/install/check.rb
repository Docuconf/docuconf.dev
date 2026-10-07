# frozen_string_literal: true

# Runs once the SDK is installed: the install check for the Get started page.
require "docuconf/anyway"

class AppConfig < Anyway::Config
  include Docuconf::Anyway
  attr_config port: 8080
  coerce_types port: :integer
  describe :port, "HTTP listen port", min: 1, max: 65_535
end

puts AppConfig.new.port == 8080 ? "ok" : "wrong default"
