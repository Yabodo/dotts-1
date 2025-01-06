<template>
	<div class="recoverPassword">
		<div class="wrapper">
			<div style="display: flex; align-items: center">
				<i @click="navTo('/')" style="padding-right: 1rem; cursor: pointer" class="bx bx-arrow-back"></i>
				<h3>{{ $t('pages.security.reset-password.pageTitle') }}</h3>
			</div>

			<form autocomplete="off" class="form">
				<vs-input
					class="field"
					v-model="email"
					:label="$t('pages.security.reset-password.email.label')"
					:placeholder="$t('pages.security.reset-password.email.placeholder')"
					:state="inputState.email"
				>
					<template #icon>
						<i class="bx bx-envelope"></i>
					</template>
					<template v-if="validEmail" #message-success>
						{{ $t('pages.security.reset-password.email.validEmail') }}
					</template>
					<template v-if="!validEmail && email !== ''" #message-danger>
						{{ $t('pages.security.reset-password.email.invalidEmail') }}
					</template>
				</vs-input>
				<div class="checkboxes">
					<div class="checkbox">
						<div>
							<vs-checkbox @click="agreed != agreed" v-model="agreed">
								<p>{{ $t('pages.security.reset-password.userAgreesWithOur') }}</p>
							</vs-checkbox>
						</div>
						<a style="font-size: 0.9rem" class="text-highlight" @click="openTerms">{{ $t('pages.security.reset-password.termsOfService') }}</a>
					</div>
					<div class="checkbox">
						<div @click="runCaptcha()" class="pointer">
							<vs-checkbox :loading="hCaptcha.checkbox.loading" v-model="hCaptcha.checkbox.checked" id="hCaptcha">
								<p>{{ $t('pages.security.reset-password.notRobot') }}</p>
							</vs-checkbox>
						</div>
					</div>
				</div>
			</form>

			<div class="button">
				<vs-button @click="submit" :loading="loading.register" block>{{ $t('pages.security.reset-password.recover') }}</vs-button>
			</div>

			<!-- Terms of service -->
			<vs-dialog class="tos" overflow-hidden not-center v-model="termsWindow">
				<termsOfService />
				<template #footer>
					<div class="footer-dialog">
						<vs-button @click="tosAgree" block>
							{{ $t('pages.security.reset-password.prompts.termsOfService.agreeWithTheseTerms') }}
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
	nhostAuth: 'guest',
	data: () => ({
		email: '',
		password: '',
		display_name: '',
		avatar_url: '',
		agreed: false,
		termsWindow: false,
		hasVisiblePassword: false,
		inputState: {
			email: 'default',
			agreed: 'default',
		},
		loading: {
			register: false,
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
			if (this.hCaptcha.verified && this.agreed && this.validEmail) {
				try {
					const response = await this.$nhost.auth.requestPasswordChange(this.email);
				} catch (e) {
					err = true;
				} finally {
					this.openNotification(
						this.$t('pages.security.reset-password.notifications.recoveryEmailSent.title'),
						this.$t('pages.security.reset-password.notifications.recoveryEmailSent.description'),
					);
					this.$router.replace('/');
				}
			} else {
				if ((!this.hCaptcha.verified || !this.agreed) && this.display_name != '' && this.validEmail && this.getProgress >= 60) {
					this.openNotification(
						this.$t('pages.security.reset-password.notifications.checkBoxesNotFilled.title'),
						this.$t('pages.security.reset-password.notifications.checkBoxesNotFilled.description'),
					);
				} else {
					this.openNotification(
						this.$t('pages.security.reset-password.notifications.fieldProblems.title'),
						this.$t('pages.security.reset-password.notifications.fieldProblems.description'),
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
			if (!this.validEmail) this.inputState.email = 'danger';
			else this.inputState.email = 'success';

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
		navTo(path) {
			this.combMenu = false;
			this.$router.replace(path);
		},
	},
	computed: {
		validEmail() {
			return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email);
		},
	},
};
</script>
