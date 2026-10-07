# frozen_string_literal: true

require "minitest/autorun"
require "anyway/testing"
require_relative "../../orders/config/orders_config"

class OrdersConfigTest < Minitest::Test
  # with_env sets these variables for the block and restores ENV afterwards.
  include Anyway::Testing::Helpers

  def test_defaults
    with_env("DATABASE_URL" => "postgres://orders@db/orders") do
      config = OrdersConfig.new
      assert_equal 8080, config.port
      assert_equal 4, config.worker_count
    end
  end

  def test_rejects_bad_values
    with_env("PORT" => "70000", "DATABASE_URL" => nil) do
      error = assert_raises(Docuconf::Anyway::ValidationError) { OrdersConfig.new }
      assert_includes error.message, "PORT [out_of_range]"
      assert_includes error.message, "DATABASE_URL [missing_required]"
    end
  end
end
