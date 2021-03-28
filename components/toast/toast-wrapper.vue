<template>
	<aside class="toast-wrapper">
		<toast-item v-for="notification in notes" :key="notification.identifier" :notification="notification" @finished="shiftNotifications" />
	</aside>
</template>

<script>
import ToastItem from './toast-item';

export default {
	components: {
		ToastItem
	},
	props: {
		notifications: {
			type: Array,
			default: () => ([])
		}
	},
	data () {
		return {
			notes: this.notifications
		};
	},
	methods: {
		shiftNotifications () {
			this.$emit('shift');
		}
	}
};
</script>

<style lang="scss" scoped>
.toast-wrapper {
	@apply absolute top-2 left-1/2 transform -translate-x-1/2 flex-col-reverse w-full max-w-md;
}
</style>
