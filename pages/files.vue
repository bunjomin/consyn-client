<template>
	<div class="container">
		<Header />
		<template v-if="fetchedFile.fetched">
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
		<Loading v-else />
	</div>
</template>

<script>
import * as IPFS from 'ipfs';
import * as concat from 'uint8arrays/concat';
import all from 'it-all';
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
			fetchedFile: {
				name: '',
				extension: '',
				mimeType: '',
				url: '',
				fetched: false
			}
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
		async get () {
			const { key: keyValue, cid, name, extension, mimeType } = (await this.$axios.get(`${this.apiUrl}/files/${this.getFile}`))?.data;
			const keyBuffer = Buffer.from(keyValue, 'hex');
			const key = await window.crypto.subtle.importKey('raw', keyBuffer, 'AES-CTR', false, ['encrypt', 'decrypt']);
			const fileData = concat(await all(this.node.cat(cid)));
			const decrypted = await this.decryptFile(fileData, key);
			const blob = new Blob([decrypted], { type: mimeType });
			const url = URL.createObjectURL(blob);
			this.fetchedFile.name = name;
			this.fetchedFile.extension = extension;
			this.fetchedFile.mimeType = mimeType;
			this.fetchedFile.url = url;
			this.fetchedFile.fetched = true;
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
</style>
