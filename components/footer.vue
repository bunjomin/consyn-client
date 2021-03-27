<template>
	<footer>
		<section class="svg-container">
			<svg
				id="copyIcon"
				aria-hidden="true"
				focusable="false"
				data-prefix="far"
				data-icon="copy"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 448 512"
			>
				<path fill="currentColor" d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z" class="" />
			</svg>
			<svg
				id="loadingSpinner"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid"
			>
				<circle
					cx="50"
					cy="50"
					fill="none"
					stroke="#3b82f6"
					stroke-width="5"
					r="30"
					stroke-dasharray="141.37166941154067 49.12388980384689"
				>
					<animateTransform
						attributeName="transform"
						type="rotate"
						repeatCount="indefinite"
						dur="1.075268817204301s"
						values="0 50 50;360 50 50"
						keyTimes="0;1"
					/>
				</circle>
			</svg>
		</section>
	</footer>
</template>

<script>
export default {};
</script>

<style lang="scss">
footer .svg-container {
	display: none;
}
</style>
