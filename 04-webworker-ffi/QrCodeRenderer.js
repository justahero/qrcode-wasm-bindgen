class QrCodeRenderer {
    // Create a new renderer that loads the WASM from the path provided.
    constructor(worker_uri, wasm_uri) {
        // load the WASM module into an array buffer, in this way we can
        // transfer it to the service worker, need to compile it there due to Chrome :(
        this.module = fetch(wasm_uri).then(response => response.arrayBuffer())

        // Create a number of workers
        this.worker = this.module.then(module => {
            let worker = new Worker(worker_uri);
            worker.postMessage(module);
            worker.onmessage = this.handleMessage.bind(this);
            return worker;
        });
    }

    // Sends the string to the web worker
    render(data, index, width, height, callback) {
        document.addEventListener(`qr_code_rendered(${data})`, (event) => {
            callback(event.detail.result);
        });

        this.worker.then(worker => {
            worker.postMessage({
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
