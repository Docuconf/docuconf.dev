import docuconf
import gleam/dict
import gleam/list
import gleeunit
import orders/config

pub fn main() {
  gleeunit.main()
}

// with_env reads this map instead of the process environment.
fn load(env: List(#(String, String))) {
  docuconf.options()
  |> docuconf.with_env(dict.from_list(env))
  |> docuconf.without_termination_log
  |> docuconf.load_with(config.spec(), _)
}

pub fn defaults_test() {
  let assert Ok(config) = load([#("DATABASE_URL", "postgres://orders@db/orders")])
  assert config.port == 8080
  assert config.worker_count == 4
}

pub fn rejects_bad_values_test() {
  let assert Error(docuconf.InvalidConfig(violations)) = load([#("PORT", "70000")])
  let found = list.map(violations, fn(v) { #(v.input, v.code) })
  assert list.contains(found, #("PORT", docuconf.OutOfRange))
  assert list.contains(found, #("DATABASE_URL", docuconf.MissingRequired))
}
