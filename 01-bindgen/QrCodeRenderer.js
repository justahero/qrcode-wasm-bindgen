const { qrcode_ffi } = wasm_bindgen;

class QrCodeRenderer {
    // Create a new renderer that loads the WASM from the path provided.
    constructor(wasm_uri) {
        // load wasm functionality
        self.instance = wasm_bindgen(wasm_uri);
    }

    // Returns a promise which resolves to a SVG DOMString that can be dropped into the DOM.
    render(data, width, height) {
        return self.instance.then(() => {
            return qrcode_ffi(data, width, height);
        });
    }
}
