/* 
Copyright 2019 Alessio P. [4v4l]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const ALGORITHM = 'AES-GCM';
const IV_SIZE = 12; // should be 12 bytes for AES-GCM
const KEY_SIZE = 32; // a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
const N_ITERATIONS = 100000;
const SALT_LENGTH = 256;
const TAG_LENGTH = 128;

if (window.File && window.FileReader && window.FileList && window.Blob) { 
		
		// encrypt zone
		var holderEnc = document.getElementById('dropZoneEnc');
		holderEnc.addEventListener("drop", droppedEnc, false);
		holderEnc.addEventListener("dragover", dragoverHandler, false);
		holderEnc.ondragleave = function() {
			this.className = "d-flex align-items-center justify-content-center";
			return false;
		}
		
		// decrypt zone
		var holderDec = document.getElementById('dropZoneDec');
		holderDec.addEventListener("drop", droppedDec, false);
		holderDec.addEventListener("dragover", dragoverHandler, false);
		holderDec.ondragleave = function() {
			this.className = "d-flex align-items-center justify-content-center";
			return false;
		}
		
		function droppedEnc(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			
			this.className = "d-flex align-items-center justify-content-center";

			var files = evt.dataTransfer.files;		
				
			displayPrompt();
			
			pw_prompt({
				lm:"Please enter a passphrase:", 
				callback: function(password) {
					reader = new FileReader();
					for (var i = 0, f; f = files[i]; i++) {
						reader.onload = (function (file) {
							var fileName = file.name;
							return function(e) {
								var salt = forge.random.getBytesSync(SALT_LENGTH);
								console.log("generating a key...");
								var key = forge.pkcs5.pbkdf2(password, salt, N_ITERATIONS, KEY_SIZE);
								var iv = forge.random.getBytesSync(IV_SIZE);
								var cipher = forge.cipher.createCipher(ALGORITHM, key);
								cipher.start({
								  iv: iv,
								  tagLength: TAG_LENGTH
								});
								console.log("encrypting '" + fileName + "'...");
								cipher.update(forge.util.createBuffer(e.target.result));
								cipher.finish();
								var encrypted = forge.util.encode64(salt).concat(forge.util.encode64(iv)).concat(forge.util.encode64(cipher.mode.tag.getBytes())).concat(forge.util.encode64(cipher.output.getBytes()));
								var a = document.createElement('a');
								a.setAttribute("href", "data:application/octet-stream," + encrypted);
								a.setAttribute("download", fileName + ".encrypted");
								a.setAttribute("target", "_blank");
								document.body.appendChild(a);
								a.click();
								document.body.removeChild(a);
								console.log("done.");
							};
						})(f);
						reader.readAsDataURL(f);
					}
					reader = null;
					files = null; 
				}
			});
		}
		
		function droppedDec(evt) {		
			evt.stopPropagation();
			evt.preventDefault();
			
			this.className = "d-flex align-items-center justify-content-center";

			var files = evt.dataTransfer.files;		
			
			displayPrompt();
			
			pw_prompt({
				lm:"Please enter the passphrase:", 
				callback: function(password) {
					reader = new FileReader();
					for (var i = 0, f; f = files[i]; i++) {
						reader.onload = (function (file) {
							var fileName = file.name;
							return function(e) {
									var data = forge.util.decode64(e.target.result);
									var salt = data.substr(0,SALT_LENGTH);
									console.log("generating the key...");
									var key = forge.pkcs5.pbkdf2(password, salt, N_ITERATIONS, KEY_SIZE);
									var decipher = forge.cipher.createDecipher(ALGORITHM, key);
									decipher.start({
									  iv: data.substr(SALT_LENGTH,IV_SIZE),
									  tagLength: TAG_LENGTH,
									  tag: data.substr(SALT_LENGTH + IV_SIZE,TAG_LENGTH / 8)
									});
									console.log("decrypting '" + fileName + "'...");
									decipher.update(forge.util.createBuffer(data.substr(SALT_LENGTH + IV_SIZE + (TAG_LENGTH / 8))));
									if(decipher.finish()) {
										decrypted = decipher.output.toString();
										// double-check the resulting file, just in case...
										if(!/^data:/.test(decrypted)){
											alert("Some error occurred :/");
											return false;
										}
										var a = document.createElement('a');
										a.setAttribute("href", decrypted);
										a.setAttribute("download", fileName.replace(".encrypted",""));
										a.setAttribute("target", "_blank");
										document.body.appendChild(a);
										a.click();
										document.body.removeChild(a);
										console.log("done.");
									}
									else {
										alert("File error :( Wrong passphrase?");
										console.log("ERROR!");
									}
							};
						})(f);
						reader.readAsText(f);
					}
					reader = null;
					files = null; 
				}
			});
		}
		
		function dragoverHandler(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			
			this.className = 'hover d-flex align-items-center justify-content-center';
			
			evt.dataTransfer.dropEffect = 'copy';
		}
		
		function displayPrompt() {
			/* http://stackoverflow.com/a/28461750 */
			var promptCount = 0;
			window.pw_prompt = function(options) {
				var lm = options.lm || "Password:",
					bm = options.bm || "Submit";
				if(!options.callback) { 
					console.log("No callback function provided! Please provide one.");
				};
							
				var prompt = document.createElement("div");
				prompt.className = "pw_prompt";
				
				var submit = function() {
					options.callback(input.value);
					document.body.removeChild(prompt);
				};
				var label = document.createElement("label");
				label.textContent = lm;
				label.for = "pw_prompt_input" + (++promptCount);
				prompt.appendChild(label);
				var input = document.createElement("input");
				input.id = "pw_prompt_input" + (promptCount);
				input.type = "password";
				input.style = "max-width: 100%;"
				input.addEventListener("keyup", function(e) {
					// ENTER
					if (e.keyCode == 13) submit();
				}, false);
				prompt.appendChild(input);
				var button = document.createElement("button");
				button.textContent = bm;
				button.addEventListener("click", submit, false);
				prompt.appendChild(button);
				
				document.body.appendChild(prompt);
			};
		}
	}
else{
	alert("The File APIs are not fully supported by this browser :(");
}