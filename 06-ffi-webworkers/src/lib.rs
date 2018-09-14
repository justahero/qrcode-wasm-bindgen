// This code is quite a bit different than the code you might be used to. Don't fear! I believe
// in you!
//
// Please take a look at the accompanying README.md located in this directory for setup/test
// instructions.

// Here we import the `qrcode` crate (like a Ruby gem). It is also declared in the `./Cargo.toml`.
extern crate qrcode;
// Import specific functionality from the `qrcode` crate.
use qrcode::{render::svg, QrCode, types::QrError};

// From the standard library we'll also import some functionality to let us work with raw C
// style strings.
use std::os::raw::c_char;
use std::ffi::CString;

/// Generate a QR code from the respective data. Returns a string containing the SVG string
/// appropriate to be saved to a file or rendered to a DOM tree.
pub fn qrcode<T>(data: T, width: u32, height: u32) -> Result<String, QrError>
where T: AsRef<[u8]> {
    QrCode::with_error_correction_level(data.as_ref(), qrcode::EcLevel::L)
        .map(|code| code.render::<svg::Color>()
        .max_dimensions(width, height)
        .min_dimensions(width, height)
        .build())
}

/// Generate a qrcode from the C string starting at the pointer provided. It is essentially an
/// unsafe proxy to `qrcode(data: &[u8])` that handles FFI concerns.
///
/// The input is a raw pointer to memory and the string located there will be freed during the
/// function execution. Use `alloc()` to get an appropriate region in memory.
///
/// Returns a new pointer to a new location in memory where the SVG code for the qrcode is located.
/// You **must** pass this pointer back to the `free()` function below.
#[no_mangle]
pub unsafe extern "C" fn qrcode_ffi(region: *mut c_char, width: u32, height: u32) -> *mut c_char {
    // This will get dropped at the end of the function.
    let arg = CString::from_raw(region).into_bytes();

    let qr_code = match qrcode(arg, width, height) {
        Ok(v) => v,
        // Since we're on an FFI boundary we can't return strongly typed errors. Instead if we get
        // an error from the qrcode generation we return the error string.
        Err(e) => format!("{}", e),
    };

    // Output the generated string as a raw C string, or (if it fails to do this) output a
    // meaningful error.
    match CString::new(qr_code).map(|v| v.into_raw()) {
        Ok(v) => v,
        Err(_e) => CString::new("Generated SVG contains NULL bytes.").unwrap().into_raw(),
    }
}

/// Allocates a zero'd region in memory for the caller.
///
/// Writing past this region will result in undefined behaivor.
///
/// You **must** free the region returned either via the `free()` function or the `qrcode_ffi()`
/// function.
#[no_mangle]
pub unsafe extern "C" fn alloc(size: usize) -> *mut c_char {
    let buffer = vec![0; size];
    // This buffer has `\0` bytes in it, but we are going to go let JS fill it in. So it's ok!
    let wrapped = CString::from_vec_unchecked(buffer);
    // When we cast into a raw pointer Rust no longer bothers with managing the related memory.
    wrapped.into_raw()
}

/// Frees the provided region in memory from the first byte of data until the first `\0` byte.
///
/// It is only appropriate to call this on a value returned from `alloc()` or `qrcode_ffi()`.
#[no_mangle]
pub unsafe extern "C" fn free(region: *mut c_char) {
    let _ = CString::from_raw(region);
}

