# WebAssembly Example

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

where `n` web workers is equal to the number of CPUs available.

The first two examples do not use any web workers, therefore using a larger number of QR codes to generate may render the web page unresponsive. The samples with `ffi` mean the memory manamgent is handled via Rust instead of using **wasm-bindgen**.


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

Then run `http-server -p 8080` to start a local web server, open browser & go to http://localhost:8080.

You can also use a different package / tool to start a web server, e.g. Python 3 [httpserver](https://pypi.org/project/httpserver/).


## Benchmarks

All examples provide a minimal HTML with an input field, to input the number of QR codes to generate.

**Note** a bigger number may result in runtime issues of your browser, e.g. may block or not respond anymore. It is recommended to pick a reasonable number (between 1 and 10.000).

The following table compares the different versions. **Note** this non-scientific benchmark is not meant to proof that one example is necessarily "better" than another or that the **wasm-bindgen** crate should not be used. The purpose is to evaluate which version was appropriate for our specific use case and what we considered for production (06-ffi-webworker).

All tests were run on 13'' Macbook Pro (2016) with 16GB Ram, 4 CPUs, in Firefox 62.0. Each benchmark is the average of 5 repeated runs.

| iterations           |     1.000 |    10.000 |
|--------------------- | --------- | --------- |
| 01-bindgen           |    1.785s |   18.900s |
| 02-ffi               |    1.382s |   14.138s |
| 03-bindgen-webworker |    2.146s |   21.767s |
| 04-ffi-webworker     |    1.795s |   16.961s |
| 05-bindgen-webworker |    1.204s |   17.005s |
| 06-ffi-webworker     |    1.158s |   14.129s |
