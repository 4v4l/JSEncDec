# JS file enc/dec
A simple user-friendly tool for encrypting/decrypting files locally in browser without ever uploading them to any server.

## Brief explanation
When a file is dropped a 256 bit encryption key is derived from a user-specified passphrase using [PBKDF2](https://en.wikipedia.org/wiki/Pbkdf2).  
The file is then either encrypted or decrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) which guarantees encryption+authentication.  
The resulting enc/dec file can be "downloaded" even if no server is ever reached: the entire process is performed locally in browser.

## Browser compatibility
I had some problems with Edge and (testing purposes only!) IE.  
It works well on Firefox. It hangs a while with large files - just wait patiently (coffee?).

## Built with
* [Forge](https://github.com/digitalbazaar/forge) - Cryptography utilities
* [Bootstrap](https://getbootstrap.com/) - Web framework

## License
This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](./LICENSE) file for details.