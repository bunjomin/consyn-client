<template>
	<main class="app">
		<section class="content">
			<Nuxt />
		</section>
		<Footer />
	</main>
</template>

<script>
import Footer from '../components/footer';

export default {
	components: {
		Footer
	}
};
</script>

<style lang="scss">
@font-face {
	font-family: 'Rubik';
	font-style: normal;
	font-weight: 400;
	font-display: swap;
	src: url('/rubik-regular.ttf') format('truetype');
}

@font-face {
	font-family: 'Rubik';
	font-style: normal;
	font-weight: 600;
	font-display: swap;
	src: url('/rubik-medium.ttf') format('truetype');
}

@font-face {
	font-family: 'Rubik';
	font-style: normal;
	font-weight: 700;
	font-display: swap;
	src: url('/rubik-bold.ttf') format('truetype');
}

html {
	@apply relative box-border text-base font-normal not-italic;
	font-family: 'Rubik', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

	* {
		@apply relative;
	}
}

h1,
h2,
h3,
h4,
h5,
h6 {
	@apply font-bold text-blue-900 uppercase;
}

h1 {
	@apply text-4xl;
}

h2 {
	@apply text-3xl;
}

h3 {
	@apply text-2xl;
}

h4 {
	@apply text-xl;
}

h5, h6 {
	@apply text-lg;
}

p {
	@apply text-base text-blue-900;
}

.app {
	@apply min-h-screen min-w-full bg-blue-50 flex items-center justify-center;
}

.content {
	@apply w-full max-w-2xl rounded-3xl overflow-hidden bg-white shadow-lg;
}

.button {
	@apply px-6 py-2 rounded-md uppercase text-blue-50 transition duration-200 ease-in-out bg-blue-500 hover:bg-blue-700 cursor-pointer;
}

input[type="file"] {
	@apply absolute opacity-0;
	z-index: -1;
}
</style>
