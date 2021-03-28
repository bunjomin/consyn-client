<template>
	<div class="preview">
		<component :is="type" :fetched-file="fetchedFile" />
		<button class="button back" @click.prevent="back">
			Back to Download
		</button>
	</div>
</template>

<script>
import ImagePreview from './image';
import VideoPreview from './video';

export default {
	components: {
		ImagePreview,
		VideoPreview
	},
	props: {
		type: {
			type: String,
			default: () => {
				return 'Image';
			}
		},
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
	},
	methods: {
		back () {
			this.$emit('back');
		}
	}
};
</script>

<style lang="scss" scoped>
.back {
	@apply absolute top-0 left-0 ml-2 mt-2 z-10;
}
</style>
