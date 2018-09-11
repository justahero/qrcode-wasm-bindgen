extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate qrcode;
use qrcode::render::svg;
use qrcode::QrCode;
use qrcode::types::QrError;

/// Generate a QR code from the respective data. Returns a string containing the SVG string
/// appropriate to be saved to a file or rendered to a DOM tree.
fn qrcode<T>(data: T, width: u32, height: u32) -> Result<String, QrError>
where T: AsRef<[u8]> {
    QrCode::with_error_correction_level(data.as_ref(), qrcode::EcLevel::Q)
        .map(|code| code.render::<svg::Color>()
            .max_dimensions(width, height)
            .min_dimensions(width, height)
            .build()
        )
}

/// Generate a qrcode from given string.
///
/// The input is a raw pointer to memory and the string located there will be freed during the
/// function execution. Use `alloc()` to get an appropriate region in memory.
///
/// Returns a new pointer to a new location in memory where the SVG code for the qrcode is located.
/// You **must** pass this pointer back to the `free()` function below.
#[wasm_bindgen]
pub fn qrcode_ffi(arg: &str, width: u32, height: u32) -> String {
    match qrcode(arg, width, height) {
        Ok(v) => v,
        // Since we're on an FFI boundary we can't return strongly typed errors. Instead if we get
        // an error from the qrcode generation we return the error string.
        Err(e) => format!("{}", e),
    }
}
