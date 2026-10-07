// Copies ../orders/src/main.rs without its inner doc comments, which include! cannot take.
fn main() {
    let src = std::fs::read_to_string("../orders/src/main.rs").expect("read main.rs");
    let body: String = src.lines().filter(|l| !l.starts_with("//!")).map(|l| format!("{l}\n")).collect();
    let out = std::path::Path::new(&std::env::var("OUT_DIR").unwrap()).join("orders.rs");
    std::fs::write(out, body).expect("write orders.rs");
    println!("cargo:rerun-if-changed=../orders/src/main.rs");
}
