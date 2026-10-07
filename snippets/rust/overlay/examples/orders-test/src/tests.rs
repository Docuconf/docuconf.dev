use super::*;
use docuconf::Code;

// Load from an explicit environment: the process environment is not read or changed.
fn load(env: &[(&str, &str)]) -> Result<Config, docuconf::Error> {
    docuconf::Loader::<Config>::new()
        .env(env.iter().copied())
        .termination_log(false)
        .load()
}

#[test]
fn defaults() {
    let config = load(&[("DATABASE_URL", "postgres://orders@db/orders")]).unwrap();
    assert_eq!(config.port, 8080);
    assert_eq!(config.worker_count, 4);
}

#[test]
fn rejects_bad_values() {
    let err = load(&[("PORT", "70000")]).unwrap_err();
    let found: Vec<_> = err.violations().iter().map(|v| (v.input.as_str(), v.code)).collect();
    assert!(found.contains(&("PORT", Code::OutOfRange)), "{found:?}");
    assert!(found.contains(&("DATABASE_URL", Code::MissingRequired)), "{found:?}");
}
