#!/bin/sh

set -ex

# Build the `hello_world.wasm` file using Cargo/rustc
cargo build --target wasm32-unknown-unknown --release

mkdir -p dist
wasm-bindgen target/wasm32-unknown-unknown/release/rust_wasm_example.wasm --out-dir ./dist --no-modules --no-typescript
