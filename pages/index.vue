<template>
	<div class="login">
		<div class="logo">
			<img width="20%" v-show="this.$colorMode.value == 'dark'" src="~/assets/images/white-no-bg.svg" alt="" />
			<img width="20%" v-show="this.$colorMode.value == 'light'" src="~/assets/images/black-no-bg.svg" alt="" />
		</div>
		<div class="wrapper">
			<form class="form">
				<vs-input class="field" type="email" v-model="email" :label="$t('pages.index.fields.username.label')" :placeholder="$t('pages.index.fields.username.placeholder')">
					<template #icon>
						<i class="bx bx-envelope"></i>
					</template>
				</vs-input>
				<vs-input
					class="field"
					type="password"
					v-model="password"
					@keydown.enter="login()"
					:label="$t('pages.index.fields.password.label')"
					:placeholder="$t('pages.index.fields.password.placeholder')"
				>
					<template #icon>
						<i class="bx bx-lock-alt"></i>
					</template>
				</vs-input>
			</form>

			<div class="button">
				<vs-button @click="login()" :loading="loading.login" block>{{ $t('pages.index.login') }}</vs-button>
			</div>
			<div class="button">
				<vs-button @click="navTo('/register')" block border>{{ $t('pages.index.register') }}</vs-button>
			</div>
			<div>
				<a class="lowlight" @click="navTo('/security/reset-password')">{{ $t('pages.index.resetPassword') }}</a>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	nhostAuth: 'guest',
	data: () => ({
		email: '',
		password: '',
		loading: {
			login: false,
		},
		attempts: 0,
	}),
	methods: {
		async login() {
			if (this.loading.login == false && this.attempts < 10) {
				let err = false;
				this.attempts++;
				this.loading.login = true;
				try {
					const response = await this.$nhost.auth.login({ email: this.email, password: this.password });
				} catch (error) {
					err = true;
				} finally {
					if (err) {
						this.openNotification(this.$t('pages.index.notifications.wrongCredentials.title'), this.$t('pages.index.notifications.wrongCredentials.description'));
						setTimeout(() => {
							this.loading.login = false;
						}, 300);
					} else {
						this.$router.push('/read');
					}
				}
			} else {
				this.loading.login = true;
				this.openNotification(this.$t('pages.index.notifications.tooManyAttempts.title'), this.$t('pages.index.notifications.tooManyAttempts.description'), 'danger');
				setTimeout(() => {
					this.loading.login = false;
					this.attempts = 0;
				}, 300000);
			}
		},
		navTo(path) {
			this.combMenu = false;
			this.$router.replace(path);
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
