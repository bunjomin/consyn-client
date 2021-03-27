module.exports = {
	root: true,
	env: {
		browser: true,
		node: true
	},
	parserOptions: {
		parser: 'babel-eslint'
	},
	extends: [
		'@nuxtjs',
		'plugin:nuxt/recommended'
	],
	plugins: [
	],
	// add your custom rules here
	rules: {
		semi: ['error', 'always'],
		indent: ['error', 'tab'],
		'no-tabs': [
			'error', {
				allowIndentationTabs: true
			}
		],
		'vue/html-indent': [
			'error', 'tab'
		]
	}
};
