<template>
	<div>
		<div class="defaultLayout">
			<div>
				<div class="guest nuxt-wrapper">
					<Nuxt />
				</div>
				<guest />
			</div>
			<div>
				<footr />
			</div>
		</div>
		<div v-if="loading || $nuxt.isOffline" class="loadingScreen">
			<div class="content">
				<div class="icon-wrapper">
					<div class="icon">
						<img height="100%" src="~/assets/images/black-no-bg.svg" alt="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="css" src="~/assets/css/core.css"></style>

<script>
import guest from '~/components/layouts/guest.vue';
import footr from '~/components/layouts/footer.vue';

export default {
	components: {
		guest,
		footr,
	},
	head() {
		let title = this.$t('layouts.dashboard.meta.title');
		let description = this.$t('layouts.dashboard.meta.description');
		let url = 'https://dotts.org';
		let imgUrl = 'https://dotts.org/og-image.png';
		let ogLocale = this.$t('layouts.dashboard.meta.og.locale');
		const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true });
		return {
			title: title,
			meta: [
				{
					hid: 'twitter:title',
					name: 'twitter:title',
					content: title,
				},
				{
					hid: 'og:title',
					name: 'og:title',
					content: title,
				},
				{
					hid: 'twitter:description',
					name: 'twitter:description',
					content: description,
				},
				{
					hid: 'twitter:description',
					name: 'twitter:description',
					content: description,
				},
				{
					hid: 'description',
					name: 'description',
					content: description,
				},
				{
					hid: 'twitter:url',
					name: 'twitter:url',
					content: url,
				},
				{
					hid: 'og:url',
					name: 'og:url',
					content: url,
				},
				{
					hid: 'og:image',
					name: 'og:image',
					content: imgUrl,
				},
				{
					hid: 'twitter:image',
					name: 'twitter:image',
					content: imgUrl,
				},
				{
					hid: 'og:locale',
					name: 'og:locale',
					content: ogLocale,
				},
				{
					hid: 'twitter:image',
					name: 'twitter:image',
					content: imgUrl,
				},
				{
					hid: 'og:type',
					name: 'og:type',
					content: 'website',
				},
				...i18nHead.meta,
			],
		};
	},
	data() {
		return {
			loading: true,
		};
	},
	beforeCreate() {
		this.loading = true;
	},
	mounted() {
		this.loading = false;
	},
};
</script>

<style scoped>
.loadingScreen {
	position: absolute;
	top: 0%;
	left: 0%;
	background-color: #fff;
	width: 100vw;
	height: 100vh;
	position: fixed;
	z-index: 99999;
}

.loadingScreen .content {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}

.loadingScreen .content .icon-wrapper {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	height: 10vh;
}

.loadingScreen .content .icon-wrapper .icon {
	height: 100%;
	-webkit-animation: sk-scaleout 1s infinite;
	animation: sk-scaleout 1s infinite ease-out-in;
}

@-webkit-keyframes sk-scaleout {
	0% {
		-webkit-transform: scale(0);
	}
	100% {
		-webkit-transform: scale(1);
		opacity: 0;
	}
}

@keyframes sk-scaleout {
	0% {
		-webkit-transform: scale(0);
		transform: scale(0);
	}
	100% {
		-webkit-transform: scale(1);
		transform: scale(1);
		opacity: 0;
	}
}
</style>
