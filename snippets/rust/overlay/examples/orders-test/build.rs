// Copies ../orders/src/main.rs without its inner doc comments, which include! cannot take,
// points its `mod webhook;` at the example's own src/webhook.rs, and drops its own
// trailing `mod tests`, which would clash with this crate's.
fn main() {
    let src = std::fs::read_to_string("../orders/src/main.rs").expect("read main.rs");
    let src = match src.find("#[cfg(test)]\nmod tests {") {
        Some(at) => &src[..at],
        None => &src[..],
    };
    let webhook = std::fs::canonicalize("../orders/src/webhook.rs").expect("find webhook.rs");
    let body: String = src
        .lines()
        .filter(|l| !l.starts_with("//!"))
        .map(|l| {
            if l.trim() == "mod webhook;" {
                format!("#[path = {:?}]\nmod webhook;\n", webhook.display().to_string())
            } else {
                format!("{l}\n")
            }
        })
        .collect();
    let out = std::path::Path::new(&std::env::var("OUT_DIR").unwrap()).join("orders.rs");
    std::fs::write(out, body).expect("write orders.rs");
    println!("cargo:rerun-if-changed=../orders/src/main.rs");
    println!("cargo:rerun-if-changed=../orders/src/webhook.rs");
}
