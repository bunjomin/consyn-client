<template>
	<img :src="fetchedFile.url" :alt="fetchedFile.name">
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
