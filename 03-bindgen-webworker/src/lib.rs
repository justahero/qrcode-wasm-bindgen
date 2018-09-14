extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate qrcode;
use qrcode::{render::svg, QrCode};

/// Generate a QR code from the respective data. Returns a string containing the SVG string
/// appropriate to be saved to a file or rendered to a DOM tree.
#[wasm_bindgen]
pub fn qrcode(arg: &str, width: u32, height: u32) -> String {
    let result = QrCode::with_error_correction_level(arg, qrcode::EcLevel::Q)
        .map(|code| code.render::<svg::Color>()
            .max_dimensions(width, height)
            .min_dimensions(width, height)
            .build()
        );

    match result {
        Ok(v) => v,
        Err(e) => format!("{}", e),
    }
}
