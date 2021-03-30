<template>
	<div class="container">
		<Header />
		<template v-if="loading">
			<div class="downloader">
				<div :class="`loading-progress progress-${roundedProgress}`" />
				<Loading />
			</div>
		</template>
		<template v-else-if="enterPassword">
			<form class="enter-password" @submit.prevent="submitPassword">
				<label for="password">
					Enter Password
					<input name="password" type="password" v-model="password">
				</label>
				<input type="submit" value="Submit" class="button">
			</form>
		</template>
		<template v-else-if="fetchedFile.fetched">
			<div v-if="viewing">
				<Preview :type="viewingType.type" :fetched-file="fetchedFile" @back="viewing = false" />
			</div>
			<div class="downloader" v-else>
				<h2 class="file-name">Download File</h2>
				<h3>{{ fetchedFile.name }}.{{ fetchedFile.extension }}</h3>
				<div class="button-wrapper">
					<template v-if="viewingType">
						<button class="button preview" @click.prevent="viewing = true">View {{ viewingType.label }}</button>
					</template>
					<a :href="fetchedFile.url" class="button" :download="`${fetchedFile.name}.${fetchedFile.extension}`">
						Download
					</a>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import * as IPFS from 'ipfs';
import * as concat from 'uint8arrays/concat';
import Header from '../components/header';
import Loading from '../components/spinner';
import Preview from '../components/preview/index';

export default {
	components: {
		Header,
		Loading,
		Preview
	},
	data() {
		return {
			node: null,
			getFile: '',
			apiUrl: null,
			viewing: false,
			enterPassword: false,
			password: '',
			fetchedFile: {
				loaded : 0,
				size: 0,
				name: '',
				extension: '',
				mimeType: '',
				url: '',
				fetched: false
			},
			fileData: {
				keyValue: '',
				cid: '',
				name: '',
				extension: '',
				size: 0,
				mimeType: '',
				passwordProtected: false,
				oneTimeUse: false,
				encrypted: true
			},
			loading: true
		};
	},
	computed: {
		viewingType () {
			if (['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/webp'].includes(this.fetchedFile?.mimeType?.toLowerCase())) {
				return {
					type: 'ImagePreview',
					label: 'Image'
				};
			} else if (['video/ogg', 'video/mp4', 'video/H264', 'video/h264-rcdo', 'video/h264-svc', 'video/webm'].includes(this.fetchedFile?.mimeType?.toLowerCase())) {
				return {
					type: 'VideoPreview',
					label: 'Video'
				};
			}
			return null;
		},
		progress () {
			return this.fetchedFile.loaded / this.fetchedFile.size;
		},
		roundedProgress () {
			const percent = Number(((this.fetchedFile.loaded / this.fetchedFile.size)* 100).toFixed(0));
			return Math.round(percent / 10) * 10;
		}
	},
	async mounted () {
		if (window.node) {
			await window.node.stop();
		}
		this.node = await IPFS.create();
		window.node = this.node;
		this.apiUrl = process.env.baseUrl;
		this.getFile = this?.$route?.query?.f;
		if (!this.getFile) {
			this.$router.push('/');
		}
		this.get();
	},
	async beforeDestroy () {
		await this.node.stop();
		window.node = null;
	},
	methods: {
		setProgress (numerator) {
			this.fetchedFile.loaded += numerator;
		},
		async loadFile () {
			let key;
			if (this.fileData.encrypted) {
				const keyBuffer = Buffer.from(this.fileData.key, 'hex');
				key = await window.crypto.subtle.importKey('raw', keyBuffer, 'AES-CTR', false, ['encrypt', 'decrypt']);
			}
			const stream = this.node.cat(this.fileData.cid);
			this.fetchedFile.size = this.fileData.size;

			let fileData = new Uint8Array([]);
			for await (const chunk of stream) {
				fileData = concat([fileData, chunk]);
				this.setProgress(chunk.length, fileData.length);
			}

			const decrypted = this.fileData.encrypted ? await this.decryptFile(fileData, key) : fileData;
			const blob = new Blob([decrypted], { type: this.fileData.mimeType });
			const url = URL.createObjectURL(blob);
			this.fetchedFile.name = this.fileData.name;
			this.fetchedFile.extension = this.fileData.extension;
			this.fetchedFile.mimeType = this.fileData.mimeType;
			this.fetchedFile.url = url;
			this.fetchedFile.fetched = true;
			if (this.viewingType) {
				this.viewing = true;
			}
			this.enterPassword = false;
			this.password = '';
			this.loading = false;
		},
		async submitPassword () {
			this.loading = true;
			try {
				const data = (await this.$axios.post(`${this.apiUrl}/files/${this.getFile}/password`, { password: this.password }))?.data;
				if (data.errors) {
					for (const error of data.errors) {
						window.consyn.parseNotification({
							type: 'error',
							message: error
						});
					}
					this.loading = false;
					return;
				}

				this.fileData = {
					...this.fileData,
					...data
				};

				this.loadFile();
			} catch (err) {
				this.loading = false;
				console.error(err);
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: "Something went wrong!"
					}
				});
			}
		},
		async get () {
			try {
				const data = (await this.$axios.get(`${this.apiUrl}/files/${this.getFile}`))?.data;
				if (data.errors) {
					for (const error of data.errors) {
						window.consyn.parseNotification({
							type: 'error',
							message: error
						});
					}
					this.loading = false;
					return;
				}
				this.fileData = {
					...this.fileData,
					...data
				};
			} catch (err) {
				this.loading = false;
				console.error(err);
				window.consyn.parseNotification({
					type: 'error',
					message: {
						content: "Could not find that file!"
					}
				});
				this.$router.push('/');
			}

			if (this.fileData.passwordProtected) {
				this.enterPassword = true;
				this.loading = false;
			} else {
				this.loadFile();
			}
		},
		async decryptFile(file, key) {
			const iv = new Uint8Array(16);
			const result = await window.crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, file);
			return result;
		}
	}
}
</script>

<style lang="scss">
.downloader {
	@apply px-2 py-3 md:px-6 md:py-4 flex flex-col items-center;

	h2 {
		@apply mb-1;
	}

	h3 {
		@apply text-center text-lg font-normal mb-3;
	}
}

.button-wrapper {
	@apply flex justify-center items-center;
}

.button {

	&.preview {
		@apply mr-2;
	}
}

.loading-progress {
	@apply w-0 absolute top-0 left-0 h-1 bg-blue-500;
	transition: width 0.1s linear;

	@for $i from 0 through 10 {
		&.progress-#{$i * 10} {
			width: calc(#{$i} * 10%);
		}
	}
}

.enter-password {
	@apply flex items-center justify-center px-2 py-3 sm:px-4 sm:py-6 w-full;
}

input {
	@apply ml-2;
}

input[type="password"] {
	@apply rounded-3xl bg-blue-100 px-2 py-1;
}
</style>
