<template>
	<div>
		<div v-if="error.statusCode === 404" class="content">
			<h1 class="title">{{ $t('layouts.error.pageNotFound.title') }}</h1>
			<p class="description">{{ $t('layouts.error.pageNotFound.description') }}</p>
			<div style="margin: 0.5rem 0" class="actions">
				<vs-button block @click="$router.push('/')">{{ $t('layouts.error.actions.backHome') }}</vs-button>
			</div>
		</div>
		<div v-else class="content">
			<h1 class="title">{{ $t('layouts.error.otherError.title') }}</h1>
			<p class="description">{{ $t('layouts.error.otherError.description') }}</p>
			<div style="margin: 0.5rem 0" class="actions">
				<vs-button block @click="$router.push('/')">{{ $t('layouts.error.actions.backHome') }}</vs-button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	layout: 'empty',
	props: ['error'],
	beforeMount() {
		this.$router.replace('/error');
	},
};
</script>
