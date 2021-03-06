<template>
	<div class="container">
		<Header />
		<Loading v-if="loading" />
		<div v-else-if="!fileResult" class="uploader">
			<div class="upload">
				<form @submit.prevent="submit">
					<div class="settings">
						<label for="encrypted" title="Should we encrypt this file or not?">
							Encrypt
							<input v-model="settings.encrypted" name="encrypted" type="checkbox">
						</label>
						<label for="one-time-use" title="If selected, this file will be deleted after it is viewed.">
							Delete After Viewing
							<input v-model="settings.oneTimeUse" name="one-time-use" type="checkbox">
						</label>
						<label for="password-protection" title="Should we password-protect this file?">
							Password Protection
							<input v-model="settings.passwordProtection" name="password-protection" type="checkbox">
						</label>
						<label v-if="settings.passwordProtection" for="password">
							Password
							<input v-model="settings.password" type="password" name="password">
						</label>
					</div>
					<input ref="fileInput" type="file" name="filefield" :multiple="false" @change="handleFile">
					<div class="visible-upload-wrapper">
						<div class="filefield-wrapper">
							<label class="file-field" for="filefield" @click.prevent="fileClick">
								<template v-if="fileNameAndExtension">
									<span class="file-name">{{ fileNameAndExtension.fileName }}</span>
									<span class="file-extension">.{{ fileNameAndExtension.fileExtension }}</span>
								</template>
								<template v-else>
									<span>Select a file...</span>
								</template>
							</label>
						</div>
						<input type="submit" value="Submit" class="button" :disabled="!file || !valid">
					</div>
				</form>
			</div>
		</div>
		<div v-else class="share">
			<h2>Shareable link</h2>
			<div class="link" title="Click to copy" @click.prevent="copyLink">
				<pre id="copyLink">{{ fileLinkText }}</pre>
				<span :class="{ 'copied': true, active: copiedLink }">Copied!</span>
				<span class="copy-icon">
					<svg>
						<use href="#copyIcon" />
					</svg>
				</span>
			</div>
			<h2>IPFS CID</h2>
			<div class="link" title="Click to copy" @click.prevent="copyCID">
				<pre id="copyCID">{{ cid }}</pre>
				<span :class="{ 'copied': true, active: copiedCID }">Copied!</span>
				<span class="copy-icon">
					<svg>
						<use href="#copyIcon" />
					</svg>
				</span>
			</div>
		</div>
	</div>
</template>

<script>
/* eslint-disable no-console */

import * as IPFS from 'ipfs';
import * as concat from 'uint8arrays/concat';
import all from 'it-all';
import Header from '../components/header';
import Loading from '../components/spinner';

export default {
	components: {
		Header,
		Loading
	},
	data () {
		return {
			location: null,
			reader: null,
			node: null,
			file: null,
			uploadedFile: null,
			fileResult: null,
			apiUrl: null,
			copiedLink: false,
			copiedCID: false,
			loading: true,
			cid: '',
			settings: {
				encrypted: true,
				passwordProtection: false,
				password: '',
				oneTimeUse: false
			}
		};
	},
	computed: {
		fileLinkText () {
			return `${this.location ? this.location.origin : ''}/files?f=${this.fileResult ? this.fileResult.file : ''}`;
		},
		fileNameAndExtension () {
			const name = this.file?.name;
			if (!name) {
				return '';
			}
			const [fileName, fileExtension] = name.split('.');
			return {
				fileName,
				fileExtension
			};
		},
		valid () {
			if (this.settings.passwordProtection) {
				if (this.settings?.password?.length < 1) {
					return false;
				}
			}
			return true;
		}
	},
	async mounted () {
		try {
			if (window?.node?.stop) {
				await window.node.stop();
			}
		} catch (err) {
			console.log(err);
		}
		try {
			this.node = await IPFS.create();
			window.node = this.node;
			this.location = window.location;
			this.apiUrl = process.env.baseUrl;
			this.loading = false;
		} catch (err) {
			console.error(err);
			window.consyn.parseNotification({
				type: 'error',
				message: {
					content: 'Something went wrong setting up Consyn! Check your console for an error.'
				}
			});
		}
	},
	async beforeDestroy () {
		try {
			if (this.node) {
				await this.node.stop();
			}
			window.node = null;
		} catch (err) {
			console.log(err);
		}
	},
	methods: {
		async copyLink () {
			try {
				await navigator.clipboard.writeText(this.fileLinkText);
				this.copiedLink = true;
				setTimeout(() => {
					this.copiedLink = false;
				}, 1000);
			} catch (err) {
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'Could not copy to clipboard! You will have to copy manually.'
					}
				});
			}
		},
		async copyCID () {
			try {
				await navigator.clipboard.writeText(this.cid);
				this.copiedCID = true;
				setTimeout(() => {
					this.copiedCID = false;
				}, 1000);
			} catch (err) {
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'Could not copy to clipboard! You will have to copy manually.'
					}
				});
			}
		},
		fileClick () {
			this.$refs.fileInput.click();
		},
		async encryptFile (file, key) {
			try {
				const iv = new Uint8Array(16);
				const result = await window.crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, file);
				return result;
			} catch (err) {
				console.error(err);
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'Something went wrong while encrypting your file! Check your console for errors.'
					}
				});
			}
		},
		async decryptFile (file, key) {
			try {
				const iv = new Uint8Array(16);
				const result = await window.crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, file);
				return result;
			} catch (err) {
				console.error(err);
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'Something went wrong while decrypting this file! Check your console for errors.'
					}
				});
			}
		},
		handleFile (e) {
			try {
				if (this.reader) {
					this.reader.abort();
				}
				const file = e.target.files[0];
				this.file = file;
			} catch (err) {
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'For some reason, we could not handle this file.'
					}
				});
			}
		},
		async submit () {
			this.loading = true;
			if (this.reader) {
				this.reader.abort();
			}

			try {
				const settings = {
					encrypted: this.settings.encrypted,
					passwordProtection: this.settings.passwordProtection,
					oneTimeUse: this.settings.oneTimeUse
				};

				if (settings.passwordProtection) {
					settings.password = this.settings.password;
				}

				let cid, key, keyValue;
				if (settings.encrypted) {
					const keyRequest = await this.$axios.post(`${this.apiUrl}/keys`, { headers: { accept: 'application/json' } });
					keyValue = keyRequest?.data?.key;

					if (!keyValue) {
						if (keyRequest?.data?.errors) {
							this.loading = false;
							for (const error of keyRequest?.data?.errors) {
								window.consyn.parseNotification({
									type: 'error',
									message: error
								});
							}
							return;
						} else {
							throw new Error('Something went wrong submitting the file...');
						}
					}

					try {
						const keyBuffer = Buffer.from(keyValue, 'hex');
						key = await window.crypto.subtle.importKey('raw', keyBuffer, 'AES-CTR', false, ['encrypt', 'decrypt']);
					} catch (err) {
						this.loading = false;
						return window.consyn.parseNotification({
							type: 'error',
							message: {
								content: 'Something went wrong while importing the encryption key...'
							}
						});
					}
				}

				this.reader = new FileReader();
				const reader = this.reader;

				try {
					this.cid = await new Promise((resolve, reject) => {
						try {
							reader.addEventListener('load', async (e) => {
								const blob = e.target.result;
								let blobToSend;
								if (settings.encrypted) {
									blobToSend = await this.encryptFile(blob, key);
								} else {
									blobToSend = blob;
								}
								const { path } = await this.node.add(blobToSend);
								resolve(path);
							});
							reader.readAsArrayBuffer(this.file);
						} catch (err) {
							reject(err);
						}
					});
					cid = this.cid;
				} catch (err) {
					this.loading = false;
					return window.consyn.parseNotification({
						type: 'error',
						message: {
							content: 'Something went wrong while uploading the file...'
						}
					});
				}

				try {
					concat(await all(this.node.cat(cid, { length: 1 })));
				} catch (err) {
					this.loading = false;
					return window.consyn.parseNotification({
						type: 'error',
						message: {
							content: 'Could not verify that your file was uploaded successfully. Please try again later.'
						}
					});
				}

				const size = this.file.size;
				const splitted = this.file.name.split('.');
				const extension = splitted.pop();
				const name = splitted.join('');

				const payload = {
					name,
					extension,
					mimeType: this.file.type,
					size,
					cid,
					settings
				};

				if (settings.encrypted) {
					payload.key = keyValue;
				}

				let result;
				try {
					result = await this.$axios.post(`${this.apiUrl}/files`, payload, { headers: { accept: 'application/json', 'content-type': 'application/json' } });
					console.log(result);
				} catch (err) {
					this.loading = false;
					return window.consyn.parseNotification({
						type: 'error',
						message: {
							content: 'Failed to send your file key to our server. Please try again later.'
						}
					});
				}

				if (result?.data?.errors) {
					this.loading = false;
					for (const error of result?.data?.errors) {
						window.consyn.parseNotification({
							type: 'error',
							message: error
						});
					}
					return;
				}

				this.fileResult = result.data;
			} catch (err) {
				this.loading = false;
				console.error(err);
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: 'Something went wrong in the upload process. Please try again later.'
					}
				});
			}
			this.loading = false;
		}
	}
};
</script>

<style lang="scss">
.uploader, .share {
	@apply px-2 py-3 md:px-4 md:py-6;
}

.link,
.file-field {
	@apply px-2 py-3 md:px-6 bg-blue-100 cursor-pointer transition duration-200 ease-in-out hover:bg-blue-200;
}

.link {
	@apply mt-2 rounded-3xl flex items-center justify-start;

	pre {
		@apply text-blue-900 inline-block font-bold text-xs overflow-hidden overflow-ellipsis max-w-9/10;
	}

	.copied {
		@apply ml-2 font-bold uppercase text-blue-900 text-xs absolute transform -translate-y-1/2 -top-4 sm:top-1/2 right-16 transition duration-100 ease-in-out opacity-0;

		&.active {
			@apply opacity-100;
		}
	}

	.copy-icon {
		@apply absolute top-1/2 transform -translate-y-1/2 right-6 w-6 h-6;

		svg {
			@apply w-full h-full text-blue-400;
		}
	}
}

.share {

	h2 {
		@apply text-lg;

		&:not(:first-of-type) {
			@apply mt-4;
		}
	}
}

.upload {

	h2 {
		@apply mb-2 text-xl;
	}

	.file-field {
		@apply flex items-end justify-start w-full rounded-tl-3xl rounded-bl-3xl text-blue-900 font-bold;

		span {
			@apply inline-block;
		}
	}

	.button {
		@apply rounded-tl-none rounded-bl-none rounded-tr-3xl rounded-br-3xl;

		&:disabled {
			@apply bg-gray-100 text-gray-400 hover:bg-gray-100 hover:shadow-none cursor-not-allowed;
		}
	}
}

.container {
	@apply w-full max-w-3xl;
}

header {
	@apply bg-blue-100;
}

form {
	@apply block w-full;

	.visible-upload-wrapper {
		@apply flex justify-center items-stretch w-full max-w-full;

		.filefield-wrapper {
			@apply block w-full max-w-4/5 overflow-hidden;
		}
	}

	.settings {
		@apply flex flex-col mb-4 md:px-2 max-w-sm w-full;

		label {
			@apply px-2 py-2 w-full uppercase text-blue-900 text-sm flex items-center justify-start;
		}

		input {
			@apply ml-2;
		}

		input[type="password"] {
			@apply rounded-3xl bg-blue-100 px-2 py-1;
		}
	}
}
</style>
