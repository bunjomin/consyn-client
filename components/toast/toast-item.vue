<template>
	<div :class="`toast ${notification.type}${active ? ' active' : ''}`">
		<span v-if="notification.message.id" class="message-id">Notification ID: {{ notification.message.id }}</span>
		<span class="message-content">{{ notification.message.content }}</span>
	</div>
</template>

<script>
export default {
	props: {
		identifier: {
			type: String,
			default: 'xxx-xxxxx'
		},
		notification: {
			type: Object,
			default: () => {
				return {
					type: 'error',
					message: {
						id: '',
						content: ''
					}
				};
			}
		}
	},
	data () {
		return {
			active: false
		};
	},
	mounted () {
		this.$nextTick(() => {
			this.active = true;
			setTimeout(() => {
				this.active = false;
				setTimeout(() => {
					this.$emit('finished');
				}, 200);
			}, 5000);
		});
	}
};
</script>

<style lang="scss">
.toast {
	@apply p-2 md:p-4 text-gray-50 shadow-lg rounded-3xl mb-4 -bottom-2 opacity-0;
	transition: bottom 0.2s ease-in-out, opacity 0.2s ease-in-out 0s;

	.message-id {
		@apply text-xs w-full block mb-2 text-gray-100;
	}

	&.error {
		@apply bg-yellow-500;
	}

	&.success {
		@apply bg-green-500;
	}

	&.active {
		@apply bottom-0 opacity-100;
	}
}
</style>
