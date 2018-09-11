// This is a "Web Worker" which utilizes WASM to generate QRCodes in the browser.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

class QrCodeWebWorker {
    constructor(wasm_uri) {
        importScripts("dist/rust_wasm_example.js");
        this.instance = wasm_bindgen(wasm_uri);
    }

    // Returns a SVG DOMString that can be dropped into the DOM.
    render(data, width, height) {
        return this.instance.then(() => wasm_bindgen.qrcode(data, width, height));
    }
}

let memoized_worker;

// This is the main handler. It is called when the worker is sent a message via the
// `the_worker.postMessage` function.
onmessage = (event) => {
    if ("init" in event.data) {
        memoized_worker = new QrCodeWebWorker(event.data["init"]);
    } else if ("data" in event.data) {
        memoized_worker.render(event.data.data, event.data.width, event.data.height).then(output => {
            postMessage({source: event.data.data, result: output });
        });
    }
};
