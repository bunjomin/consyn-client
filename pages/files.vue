<template>
	<div class="container">
		<Header />
		<template v-if="fetchedFile.fetched">
			<div v-if="viewing">
				<button class="button back" @click.prevent="viewing = false">Back</button>
				<img :src="fetchedFile.url" :alt="fetchedFile.name">
			</div>
			<div class="downloader" v-else>
				<template v-if="['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/webp'].includes(fetchedFile.mimeType)">
					<button class="button view-image" @click.prevent="viewing = true">View Image</button>
				</template>
				<a :href="fetchedFile.url" class="button" :download="`${fetchedFile.name}.${fetchedFile.extension}`">
					<span>Download</span><span class="file-name">{{ fetchedFile.name }}</span>.<span class="file-extension">{{ fetchedFile.extension }}</span>
				</a>
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

export default {
	components: {
		Header,
		Loading
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
	@apply px-6 py-4 flex justify-end;

	a {
		@apply max-w-full flex justify-center items-center whitespace-nowrap text-xs md:text-sm lg:text-base;

		span {
			@apply inline-block;

			&:not(:last-child) {
				@apply mr-1;
			}

			&.file-name {
				@apply overflow-hidden overflow-ellipsis;
			}
		}
	}
}

.button {

	&.back {
		@apply absolute top-0 left-0 ml-2 mt-2 z-10;
	}

	&.view-image {
		@apply mr-2;
	}
}
</style>
