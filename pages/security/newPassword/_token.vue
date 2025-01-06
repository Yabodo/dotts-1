<template>
	<div class="recoverPassword">
		<div class="wrapper">
			<h3>{{ $t('pages.security.newPassword._token.pageTitle') }}</h3>
			<div class="form">
				<vs-input
					class="field"
					type="password"
					v-model="password"
					:label="$t('pages.security.newPassword._token.password.label')"
					:placeholder="$t('pages.security.newPassword._token.password.placeholder')"
					:progress="passwordStrength"
					@click-icon="hasVisiblePassword = !hasVisiblePassword"
					:visiblePassword="hasVisiblePassword"
					:state="passwordMatch"
				>
					<template #icon>
						<i class="bx bx-lock-alt"></i>
					</template>
					<template v-if="passwordStrength < 40 && password !== ''" #message-danger>
						<p>{{ $t('pages.security.newPassword._token.password.tooWeak') }}</p>
					</template>
					<template v-else-if="passwordStrength < 80 && password !== ''" #message-warn>
						<p v-if="passwordStrength < 60">{{ $t('pages.security.newPassword._token.password.almostGood') }}</p>
						<p v-else>{{ $t('pages.security.newPassword._token.password.goodEnough') }}</p>
					</template>
					<template v-else-if="passwordStrength <= 100 && password !== ''" #message-success>
						<p v-if="passwordStrength < 100">{{ $t('pages.security.newPassword._token.password.strongPassword') }}</p>
						<p v-else>{{ $t('pages.security.newPassword._token.password.perfect') }}</p>
					</template>
				</vs-input>
				<vs-input
					class="field"
					type="password"
					v-model="password2"
					:label="$t('pages.security.newPassword._token.password.repeatLabel')"
					:placeholder="$t('pages.security.newPassword._token.password.placeholder')"
					@click-icon="hasVisiblePassword = !hasVisiblePassword"
					:visiblePassword="hasVisiblePassword"
					:state="passwordMatch"
				>
					<template #icon>
						<i class="bx bx-lock-alt"></i>
					</template>
				</vs-input>
				<div class="checkboxes">
					<div class="checkbox">
						<div>
							<vs-checkbox @click="agreed != agreed" v-model="agreed">
								<p>{{ $t('pages.security.newPassword._token.userAgreesWithOur') }}</p>
							</vs-checkbox>
						</div>
						<a style="font-size: 0.9rem" class="text-highlight" @click="openTerms">{{ $t('pages.security.newPassword._token.termsOfService') }}</a>
					</div>
					<div class="checkbox">
						<div @click="runCaptcha()" class="pointer">
							<vs-checkbox :loading="hCaptcha.checkbox.loading" v-model="hCaptcha.checkbox.checked" id="hCaptcha">
								<p>{{ $t('pages.security.newPassword._token.notRobot') }}</p>
							</vs-checkbox>
						</div>
					</div>
				</div>
			</div>

			<div class="button">
				<vs-button @click="submit" :loading="loading.register" block>{{ $t('pages.security.newPassword._token.updatePassword') }}</vs-button>
			</div>

			<!-- Terms of service -->
			<vs-dialog class="tos" overflow-hidden not-center v-model="termsWindow">
				<termsOfService />
				<template #footer>
					<div class="footer-dialog">
						<vs-button @click="tosAgree" block>
							{{ $t('pages.security.newPassword._token.prompts.termsOfService.agreeWithTheseTerms') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>

			<!-- Invisible -->
			<vue-hcaptcha
				sitekey="f9d413bd-39c5-4ffe-80df-2bee0a7b92f8"
				ref="invisibleHcaptcha"
				size="invisible"
				theme="dark"
				@verify="onVerify"
				@expired="onExpire"
				@challengeExpired="onChallengeExpire"
				@error="onError"
				@closed="onClose"
			/>
		</div>
	</div>
</template>

<script>
import VueHcaptcha from '@hcaptcha/vue-hcaptcha';
import termsOfService from '~/components/legal/termsOfService.vue';

export default {
	nhostAuth: false,
	data: () => ({
		password: '',
		password2: '',
		token: null,
		agreed: false,
		termsWindow: false,
		hasVisiblePassword: false,
		inputState: {
			password: 'default',
			agreed: 'default',
		},
		loading: {
			updatePassword: false,
		},
		hCaptcha: {
			checkbox: {
				loading: false,
				window: false,
				checked: false,
			},
			verified: false,
			expired: false,
			token: null,
			eKey: null,
			error: null,
		},
		tos: null,
	}),
	async asyncData({ params }) {
		const token = params.token; // When calling /abc the slug will be "abc"
		return { token };
	},
	components: {
		VueHcaptcha,
		termsOfService,
	},
	methods: {
		openTerms() {
			this.tos = this.$t('pages');
			this.termsWindow = true;
		},
		async submit() {
			let err = false;
			if (this.hCaptcha.verified && this.agreed && this.passwordStrength >= 60 && this.password == this.password2) {
				try {
					const response = await this.$nhost.auth.confirmPasswordChange(this.password, this.token);
				} catch (e) {
					err = true;
				} finally {
					if (!err) {
						this.openNotification(
							this.$t('pages.security.newPassword._token.notifications.passwordUpdated.title'),
							this.$t('pages.security.newPassword._token.notifications.passwordUpdated.description'),
						);
						this.$router.push('/');
					} else {
						this.openNotification(
							this.$t('pages.security.newPassword._token.notifications.linkExpired.title'),
							this.$t('pages.security.newPassword._token.notifications.linkExpired.description'),
						);
						this.$router.push('/');
					}
				}
			} else {
				if ((!this.hCaptcha.verified || !this.agreed) && this.display_name != '' && this.validEmail && this.passwordStrength >= 60) {
					this.openNotification(
						this.$t('pages.security.newPassword._token.notifications.checkBoxesNotFilled.title'),
						this.$t('pages.security.newPassword._token.notifications.checkBoxesNotFilled.description'),
					);
				} else {
					this.openNotification(
						this.$t('pages.security.newPassword._token.notifications.fieldProblems.title'),
						this.$t('pages.security.newPassword._token.notifications.fieldProblems.description'),
					);
					this.checkFields();
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
		checkFields() {
			if (this.passwordStrength < 60) this.inputState.password = 'danger';
			else this.inputState.password = 'success';

			if (!this.agreed) this.inputState.agreed = 'danger';
			else this.inputState.agreed = 'success';

			return;
		},
		async onVerify(token, ekey) {
			this.hCaptcha.token = token;
			this.hCaptcha.eKey = ekey;
			/*const result = await this.$hVerify(this.hCaptcha.token);
		if(result) {
			this.hCaptcha.verified = true;
			this.hCaptcha.checkbox.loading = false;
			this.hCaptcha.checkbox.checked = true;
		}
		else {
			this.hCaptcha.checkbox.loading = false;
			this.hCaptcha.checkbox.checked = false;
		} */
			//console.log(`Callback token: ${token}, ekey: ${ekey}`);
			this.hCaptcha.verified = true;
			this.hCaptcha.checkbox.loading = false;
			this.hCaptcha.checkbox.checked = true;
		},
		onExpire() {
			this.hCaptcha.checkbox.loading = false;
			this.verified = false;
			this.token = null;
			this.eKey = null;
			this.expired = true;
			//console.log('Expired');
		},
		onChallengeExpire() {
			this.hCaptcha.checkbox.loading = false;
			this.verified = false;
			this.token = null;
			this.eKey = null;
			this.expired = true;
			//console.log(`Challenge expired`);
		},
		onError(err) {
			this.token = null;
			this.eKey = null;
			this.error = err;
			//console.log(`Error: ${err}`);
		},
		onClose() {
			this.hCaptcha.checkbox.loading = false;
		},
		runCaptcha() {
			this.hCaptcha.checkbox.loading = true;
			this.$refs.invisibleHcaptcha.execute();
		},
		tosAgree() {
			this.termsWindow = false;
			this.agreed = true;
		},
	},
	computed: {
		passwordStrength() {
			let strength = 0;

			// at least one number

			if (/\d/.test(this.password)) {
				strength += 20;
			}

			// at least one capital letter

			if (/(.*[A-Z].*)/.test(this.password)) {
				strength += 20;
			}

			// at menons a lowercase

			if (/(.*[a-z].*)/.test(this.password)) {
				strength += 20;
			}

			// at least one special character

			if (/[^A-Za-z0-9]/.test(this.password)) {
				strength += 20;
			}

			// more than 5 digits

			if (this.password.length >= 8) {
				strength += 20;
			} else {
				strength = 0;
			}

			return strength;
		},
		passwordMatch() {
			let strength = this.passwordStrength;
			if (this.password == this.password2 && strength > 60) return 'success';
			else return 'default';
		},
	},
};
</script>
