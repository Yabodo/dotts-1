<template>
	<ul class="language-content absolute right-0 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20">
		<li
			class="block px-4 py-2 text-sm capitalize text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white dark:hover:text-white"
			v-for="lang in $i18n.locales"
			:key="lang.code"
			@click="changeLocale(lang.code)"
		>
			{{ lang.name }}
		</li>
	</ul>
</template>

<script>
export default {
	methods: {
		changeLocale(language) {
			this.$i18n.locale = language;
			this.$i18n.setLocaleCookie(language);
		},
	},
};
</script>
