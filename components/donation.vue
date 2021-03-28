<template>
	<section class="donation">
		<div class="wrapper">
			<h3>Enjoying this project? Consider donating.</h3>
			<ul>
				<li>
					<strong>BTC:</strong><pre>zpub6n1ZniS6nt9paw3CwjGSnFcjThMt2GvLrf5ApxZuHTXVmeFQ8dEm2MaatwK8jnLiDg5tnUFS6tQx1RUmwvxc3ecBRPmb2EBPqbjKzk5eYTS</pre>
				</li>
				<li>
					<strong>ETH:</strong><pre>0xab98335d8b3874792a6ee4f8aeb43d287ab15a42</pre>
				</li>
				<li>
					<strong>RVN:</strong><pre>RD25zpTLHqUVRoFgt2QKQhHPYVf3msZ5tD</pre>
				</li>
			</ul>
		</div>
	</section>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.donation {
	@apply w-full min-w-full bg-blue-400 flex flex-col justify-center items-center px-2 pt-16 pb-8 text-gray-100;

	.wrapper {
		@apply max-w-5xl;
	}

	h3 {
		@apply text-lg  text-gray-50 mb-4;
	}

	ul {
		@apply flex flex-col;

		li {
			@apply flex items-start justify-start mb-4;

			strong,
			pre {
				@apply w-auto inline-block leading-normal text-base;
			}

			pre {
				@apply pl-2 whitespace-normal break-all;
			}
		}
	}
}
</style>
