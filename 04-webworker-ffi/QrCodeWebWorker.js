// This is a "Web Worker" which utilizes WASM to generate QRCodes in the browser.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

class QrCodeWebWorker {
    // Create a new renderer that loads the WASM from the path provided.
    constructor(arrayBuffer) {
        this.instance = this.initWebAssembly(arrayBuffer);
        this.encoder = new TextEncoder(`UTF-8`);
        this.decoder = new TextDecoder(`UTF-8`);
    }

    async initWebAssembly(arrayBuffer) {
        const module = await WebAssembly.compile(arrayBuffer);
        const instance = await WebAssembly.instantiate(module, {});
        return instance;
    }

    // Returns a SVG DOMString that can be dropped into the DOM.
    render(data, width, height) {
        return this.instance.then(instance => {
            const input = this.encoder.encode(data);
            // We ask the Rust code to allocate us a block of memory equal to the size we need.
            // It returns to us the start of the block of memory, and we know it spans
            // `input.length` bytes.
            const input_view_start = instance.exports.alloc(input.length);
            // Once we know the start we can build a typed view into that block. (No data is
            // copied here)
            let input_view = new Uint8Array(
                instance.exports.memory.buffer,
                input_view_start,
                input.length
            );
            // Now we can copy the encoded input into that block.
            input_view.set(input);

            // Make the call, getting back a pointer to the start of the SVG string returned.
            // Since this is a consuming call Rust will know that it can deallocate the input
            // memory here.
            const output_view_start = instance.exports.qrcode_ffi(input_view_start, width, height);

            // We now know the start location of the output memory block, so we'll create another
            // view into
            // the VM's memory spanning from there until the end of memory. (Again, no copy here).
            const output_view_temporary = new Uint8Array(
                instance.exports.memory.buffer,
                output_view_start
            );
            // At this point we need to clamp the end of the view to the end of the string.
            // Since we're working with C compatible strings we know that the first `\0` byte
            // means the end of the string.
            // This is `O(n)` where `n` is the length of the output string.
            const output_view_end = output_view_temporary.findIndex(digit => digit == 0);
            const output_view = output_view_temporary.subarray(0, output_view_end);
            const output = this.decoder.decode(output_view);

            // Finally we tell Rust it can forget about the memory it allocated for the output.
            instance.exports.free(output_view_start);
            return output;
        });
    }
}

let memoized_worker;

// This is the main handler. It is called when the worker is sent a message via the
// `the_worker.postMessage` function.
onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
        // When we get a wasm array buffer we know we need to instantiate.
        memoized_worker = new QrCodeWebWorker(event.data);
    } else {
        memoized_worker.render(event.data.data, event.data.width, event.data.height).then(output => {
            postMessage({
                source: event.data.data,
                result: output,
            });
        });
    }
};
