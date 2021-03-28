<template>
	<video class="preview-video" controls>
		<source :src="fetchedFile.url" :type="fetchedFile.mimeType">
	</video>
</template>

<script>
export default {
	props: {
		fetchedFile: {
			type: Object,
			default: () => {
				return {
					name: '',
					extension: '',
					mimeType: '',
					url: '',
					fetched: false
				};
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.preview-video {
	@apply p-4 w-full h-full;
}
</style>
