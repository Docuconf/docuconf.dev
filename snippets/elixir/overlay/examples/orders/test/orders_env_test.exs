defmodule Orders.EnvTest do
  use ExUnit.Case, async: true

  # load/1 with an explicit env: map never reads or changes the process environment.
  test "defaults" do
    {:ok, env} = Orders.Env.load(env: %{"DATABASE_URL" => "postgres://orders@db/orders"})
    assert env.port == 8080
    assert env.worker_count == 4
  end

  test "rejects bad values" do
    {:error, error} = Orders.Env.load(env: %{"PORT" => "70000"})
    found = Enum.map(error.violations, &{&1.input, &1.code})
    assert {"PORT", :out_of_range} in found
    assert {"DATABASE_URL", :missing_required} in found
  end
end
