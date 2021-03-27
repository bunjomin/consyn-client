<template>
	<header>
		<a href="/" class="inline-block">
			<h1 class="inline-block w-auto">Consyn</h1>
			<br>
			<p class="inline-block w-auto">Secure P2P file-sharing</p>
		</a>
	</header>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
header {
	@apply px-6 py-4 bg-blue-100;

	a {

		h1,
		p {
			transition: color 0.2s ease-in-out;
		}

		&:hover {

			h1,
			p {
				@apply text-blue-600;
			}
		}
	}
}
</style>
