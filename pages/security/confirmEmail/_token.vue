<template>
	<div>Dotts working its magic.</div>
</template>

<script>
export default {
	nhostAuth: false,
	data: () => ({
		token: null,
	}),
	async asyncData({ params }) {
		const token = params.token; // When calling /abc the slug will be "abc"
		return { token };
	},
	mounted() {
		this.validate();
	},
	methods: {
		async validate() {
			let err = false;
			try {
				const response = await this.$nhost.auth.confirmEmailChange(this.token);
			} catch (e) {
				err = true;
			} finally {
				if (!err) {
					this.openNotification(
						this.$t('pages.security.confirmEmail._token.notifications.userActivated.title'),
						this.$t('pages.security.confirmEmail._token.notifications.userActivated.description'),
					);
					this.$router.replace('/');
				} else {
					this.openNotification(
						this.$t('pages.security.confirmEmail._token.notifications.linkExpired.title'),
						this.$t('pages.security.confirmEmail._token.notifications.linkExpired.description'),
					);
					this.$router.replace('/');
				}
			}
		},
		openNotification(title, text, color = 'primary', duration = 6000) {
			this.$vs.notification({
				duration: duration,
				position: 'top-center',
				color: color,
				title: title,
				text: text,
			});
		},
	},
};
</script>
