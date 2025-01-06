import i18n from './locales/i18n';

export default {
	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'Dotts.org - Making History',
		meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { hid: 'description', name: 'description', content: '' }],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
			{ rel: 'stylesheet', type: 'text/css', href: 'https://unpkg.com/boxicons@2.1.2/css/boxicons.min.css' },
		],
	},

	/*serverMiddleware: [
		{ path: "/api", handler: "~/api/index.js" },
	],*/

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
		// https://vuesax.com/docs/
		'vuesax/dist/vuesax.css',
		// CSS file in the project
		'~/assets/css/core.css',
		'node_modules/lite-youtube-embed/src/lite-yt-embed.css',
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: ['@nuxtjs/color-mode'],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/pwa
		'@nuxtjs/pwa', //-- Interferes with DEVELOPMENT
		// https://github.com/nuxt-community/apollo-module
		'@nuxtjs/apollo',
		// https://docs.nhost.io/libraries/nhost-nuxt
		'@nhost/nuxt',
		// https://i18n.nuxtjs.org/
		'nuxt-i18n',
	],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'~/plugins/vuesax',
		'~/plugins/youtube.client.js',
		//'~/plugins/boxicons.client.js',
		'~/plugins/api-client.js',
		'~/plugins/vue-check-view.js',
		{
			src: '~/plugins/nhost-apollo-ws-client.js',
			mode: 'client',
		},
	],

	loading: {
		color: 'blue',
		height: '5px',
	},

	// PWA module configuration: https://go.nuxtjs.dev/pwa
	pwa: {
		manifest: {
			name: 'Dotts',
			short_name: 'Dotts',
			description: 'History in the Making',
			theme_color: 'dark',
			lang: 'en',
			background_color: '#091a28',
		},
		meta: {
			name: 'Dotts',
			author: 'Choicism Investments OÜ',
			description: 'History in the Making',
			theme_color: 'dark',
			lang: 'en',
			ogType: 'website',
			ogHost: 'http://207.154.210.23',
			ogUrl: 'https://dotts.org',
			ogTitle: 'Dotts.org',
			ogDescription: 'History in the Making',
			ogImage: '~/static/og-image.png',
		},
		icon: {
			fileName: 'icon3.png',
		},
	},

	apollo: {
		clientConfigs: {
			default: '~/plugins/nhost-apollo-config.js',
		},
	},

	// NHost module configuration: https://docs.nhost.io/libraries/nhost-js-sdk#setup
	nhost: {
		baseURL: 'https://backend-955f4be1.nhost.app',
		routes: {
			home: '/read',
			logout: '/',
		},
		// optional other nhost-js-sdk setup options
	},

	i18n: {
		seo: true,
		baseUrl: 'https://dotts.org',
		defaultLocale: 'en',
		locales: [
			{ code: 'en', iso: 'en-US', name: 'English' },
			{ code: 'et', iso: 'et-EE', name: 'Eesti' },
		],
		strategy: 'no_prefix',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_redirected',
			onlyOnNoPrefix: true,
		},
		vueI18nLoader: true,
		vueI18n: i18n,
	},

	colorMode: {
		preference: 'system', // default value of $colorMode.preference
		fallback: 'light', // fallback value if not system preference found
	},

	router: {
		middleware: ['nhost/auth'],
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {},
	server: {
		port: 8000, // default: 3000
	},
  publicRuntimeConfig: {
    hcaptchaSecret: process.env.HCAPTCHA_SECRET,
    hasuraSecret: process.env.HASURA_SECRET,
    hasuraGraphQL: process.env.HASURA_GRAPHQL,
    hasuraGraphQLWss: process.env.HASURA_GRAPHQL_WSS,
  },
};
