class QrCodeRenderer {
    // Create a new renderer that loads the WASM from the path provided.
    constructor(worker_uri, wasm_uri) {
        this.worker = new Worker(worker_uri);
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.postMessage({"init": wasm_uri});
    }

    // Returns a promise which resolves to a SVG DOMString that can be dropped into the DOM.
    render(data, width, height) {
        return new Promise((resolve, reject) => {
            document.addEventListener(`qr_code_rendered(${data})`, (event) => {
                resolve(event.detail.result);
            });

            this.worker.postMessage({
                data: data,
                width: width,
                height: height,
            });
        });
    }

    // Handle an event coming from the WebWorker.
    handleMessage(event) {
        document.dispatchEvent(new CustomEvent(`qr_code_rendered(${event.data.source})`, {
            detail: {
                result: event.data.result,
            }
        }));
    }
}
