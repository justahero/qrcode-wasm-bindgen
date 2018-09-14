# QR code example

An example project with Rust, WebAssembly & Web workers using [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/). 

The purpose of this repository is to provide different versions on how to run Rust code in WebAssembly in order to render a number of QR codes. These versions are structured as follows, if **wasm-bindgen** used, and how many web workers.

| example              | wasm-bindgen | # web workers |
| -------------------- | ------------ | ------------- |
| 01-bindgen           |          yes |             - |
| 02-ffi               |           no |             - |
| 03-bindgen-webworker |          yes |             1 |
| 04-ffi-webworker     |           no |             1 |
| 05-bindgen-webworker |          yes |             n |
| 06-ffi-webworker     |           no |             n |

where `n` web workers is dependent on the number of CPUs available.

The first two examples do not use any web workers, therefore using a larger number of QR codes to generate will make the page unresponsive, so be considerate.


## Setup

Every folder is a separate example, all share the same steps to compile, build and run the sample. To run an example, go to the appropriate folder, run the following script to compile the code:

```bash
$ ./build.sh
```

Then run a local web server from within the sample folder, e.g. by using Node's [http-server](https://www.npmjs.com/package/http-server).

First time install the package via NPM:

```bash
$ npm install http-server -g
```

Then run `http-server -p 8080` to start a local web server.

You can also use a different package / tool to start a web server, e.g. Python 3 [httpserver](https://pypi.org/project/httpserver/).


## Benchmarks

All examples provide a minimal HTML with an input field, where the number to generate the QR codes can be given.

**Note** a bigger number may result in runtine issues, e.g. the browser may block or not respond anymore. It is recommended to pick a number between 1 and 10.000.

The following table compares the different versions. **Note** the benchmark is not meant to be interpreted that one version is better than the other or not to use the **wasm-bindgen** crate. The purpose was to evaluate which version was appropriate for our specific use case and what we considered for production (06-ffi-webworker).

All tests were run on 13'' Macbook Pro (2016) with 16GB Ram with Firefox 62.0, each benchmark is the average of 10 repeated runs.

| example              |     1.000 |    10.000 |
|--------------------- | --------- | --------- |
| 01-bindgen           |           |           |
| 02-ffi               |           |           |
| 03-bindgen-webworker |           |           |
| 04-ffi-webworker     |           |           |
| 05-bindgen-webworker |           |           |
| 06-ffi-webworker     |           |           |
