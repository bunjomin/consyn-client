<template>
	<div class="container">
		<Header />
		<Loading v-if="loading" />
		<div v-else-if="!fileResult" class="uploader">
			<div class="upload">
				<form @submit.prevent="submit">
					<label for="filefield" @click.prevent="fileClick">
						{{ file ? file.name : 'Select a file...' }}
					</label>
					<input ref="fileInput" type="file" name="filefield" multiple="false" @change="handleFile">
					<input type="submit" class="button" :disabled="!file">
				</form>
			</div>
		</div>
		<div v-else class="share">
			<h2>Shareable link</h2>
			<div class="link" title="Click to copy" @click.prevent="copyToClipboard">
				<pre id="copyLink">{{ fileLinkText }}</pre>
				<span :class="{ 'copied': true, active: copied }">Copied!</span>
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
import * as IPFS from 'ipfs';
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
			copied: false,
			loading: true
		};
	},
	computed: {
		fileLinkText () {
			return `${this.location ? this.location.origin : ''}/files?f=${this.fileResult ? this.fileResult.file : ''}`;
		}
	},
	async mounted () {
		if (window?.node?.stop) {
			await window.node.stop();
		}
		this.node = await IPFS.create();
		window.node = this.node;
		this.location = window.location;
		this.apiUrl = process.env.baseUrl;
		this.loading = false;
	},
	async beforeDestroy () {
		try {
			if (this.node) {
				await this.node.stop();
			}
			window.node = null;
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	},
	methods: {
		copyToClipboard () {
			navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
				if (result.state === 'granted' || result.state === 'prompt') {
					navigator.clipboard.writeText(this.fileLinkText).then(() => {
						this.copied = true;
						setTimeout(() => {
							this.copied = false;
						}, 2000);
					}, function () {
						/* clipboard write failed */
					});
				}
			});
		},
		fileClick () {
			this.$refs.fileInput.click();
		},
		async encryptFile (file, key) {
			const iv = new Uint8Array(16);
			const result = await window.crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, file);
			return result;
		},
		async decryptFile (file, key) {
			const iv = new Uint8Array(16);
			const result = await window.crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, file);
			return result;
		},
		handleFile (e) {
			if (this.reader) {
				this.reader.abort();
			}
			const file = e.target.files[0];
			this.file = file;
		},
		async submit () {
			this.loading = true;
			if (this.reader) {
				this.reader.abort();
			}
			const keyRequest = await this.$axios.post(`${this.apiUrl}/keys`, { headers: { accept: 'application/json' } });
			const keyValue = keyRequest?.data?.key;
			const keyBuffer = Buffer.from(keyValue, 'hex');
			const key = await window.crypto.subtle.importKey('raw', keyBuffer, 'AES-CTR', false, ['encrypt', 'decrypt']);

			this.reader = new FileReader();
			const reader = this.reader;

			const cid = await new Promise((resolve, reject) => {
				try {
					reader.addEventListener('load', async (e) => {
						const blob = e.target.result;
						const encryptedBlob = await this.encryptFile(blob, key);
						const { path } = await this.node.add(encryptedBlob);
						resolve(path);
					});
					reader.readAsArrayBuffer(this.file);
				} catch (err) {
					reject(err);
				}
			});

			const [name, extension] = this.file.name.split('.');

			const payload = {
				name,
				extension,
				mimeType: this.file.type,
				key: keyValue,
				cid
			};

			const result = await this.$axios.post(`${this.apiUrl}/files`, payload, { headers: { accept: 'application/json', 'content-type': 'application/json' } });

			this.fileResult = result.data;
			this.loading = false;
		}
	}
};
</script>

<style lang="scss">
@keyframes fadeOut {
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
}

.uploader, .share {
	@apply px-6 py-6;
}

.link {
	@apply mt-2 px-6 py-3 bg-blue-100 rounded-3xl cursor-pointer transition duration-200 ease-in-out hover:bg-blue-200;

	pre {
		@apply text-blue-900 inline-block text-xs;
	}

	.copied {
		@apply ml-2 font-bold uppercase text-blue-900 opacity-0 text-xs absolute top-1/2 transform -translate-y-1/2 right-16;
		transition: opacity 0.1s ease-in-out;

		&.active {
			@apply opacity-100;
			animation: fadeOut 1s ease-in 1s 1 forwards;
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
	}
}

.upload {

	h2 {
		@apply mb-2 text-xl;
	}

	label {
		@apply cursor-pointer bg-blue-50 transition duration-200 ease-in-out hover:bg-blue-100 px-6 py-3 w-full rounded-tl-3xl rounded-bl-3xl text-blue-900 font-bold;
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
	@apply flex w-full justify-between;
}
</style>
