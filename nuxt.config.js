const env = process.env.NODE_ENV;

export default {
	// Target: https://go.nuxtjs.dev/config-target
	target: 'static',

	server: {
		port: 3030
	},

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'Consyn: Secure P2P File-sharing',
		htmlAttrs: {
			lang: 'en'
		},
		meta: [
			{ charset: 'utf-8' },
			{ hid: 'description', name: 'description', content: 'Free, secure P2P file-sharing.' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'apple-mobile-web-app-title', content: 'Consyn' },
			{ name: 'application-name', content: 'Consyn' },
			{ name: 'msapplication-TileColor', content: '#1e3a8a' },
			{ name: 'theme-color', content: '#1e3a8a' }
		],
		link: [
			{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
			{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
			{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
			{ rel: 'manifest', href: '/site.webmanifest' },
			{ rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#1e3a8a' }
		]
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		// '~/plugins/ipfs.js'
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/eslint
		// '@nuxtjs/eslint-module',
		// https://go.nuxtjs.dev/tailwindcss
		'@nuxtjs/tailwindcss'
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios'
	],

	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
	},
	vue: {
		config: {
			productionTip: env !== 'development',
			devtools: env === 'development'
		}
	},
	env: {
		baseUrl: env === 'production' ? 'https://api.consyn.io/dev' : 'http://localhost:3000/dev'
	}
};
