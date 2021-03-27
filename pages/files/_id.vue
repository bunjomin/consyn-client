<template>
	<div class="container">
		<Header />
		<div class="downloader" v-if="fetchedFile.fetched">
			<a :href="fetchedFile.url" class="button" :download="`${fetchedFile.name}.${fetchedFile.extension}`">
				Download {{ fetchedFile.name }}.{{ fetchedFile.extension }}
			</a>
		</div>
		<Loading v-else />
	</div>
</template>

<script>
import * as IPFS from 'ipfs';
import * as concat from 'uint8arrays/concat';
import all from 'it-all';
import Header from '../../components/header';
import Loading from '../../components/spinner';

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
			fetchedFile: {
				name: '',
				extension: '',
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
		this.getFile = this?.$route?.params?.id;
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
}
</style>