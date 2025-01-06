<template>
	<div class="register">
		<div class="wrapper">
			<div style="display: flex; align-items: center">
				<i @click="navTo('/')" style="padding-right: 1rem; cursor: pointer" class="bx bx-arrow-back"></i>
				<h3>{{ $t('pages.register.index.pageTitle') }}</h3>
			</div>

			<form autocomplete="off" class="form">
				<vs-input
					class="field"
					v-model="display_name"
					:label="$t('pages.register.index.fields.username.label')"
					:placeholder="$t('pages.register.index.fields.username.placeholder')"
					:state="inputState.display_name"
				>
					<template #icon>
						<i class="bx bx-user"></i>
					</template>
				</vs-input>
				<vs-input
					class="field"
					v-model="email"
					:label="$t('pages.register.index.fields.email.label')"
					:placeholder="$t('pages.register.index.fields.email.placeholder')"
					:state="inputState.email"
				>
					<template #icon>
						<i class="bx bx-envelope"></i>
					</template>
					<template v-if="validEmail" #message-success>
						{{ $t('pages.register.index.fields.email.validEmail') }}
					</template>
					<template v-if="!validEmail && email !== ''" #message-danger>
						{{ $t('pages.register.index.fields.email.invalidEmail') }}
					</template>
				</vs-input>
				<vs-input
					class="field"
					type="password"
					v-model="password"
					:label="$t('pages.register.index.fields.password.label')"
					:placeholder="$t('pages.register.index.fields.password.placeholder')"
					:progress="getProgress"
					@click-icon="hasVisiblePassword = !hasVisiblePassword"
					:visiblePassword="hasVisiblePassword"
					:state="inputState.password"
				>
					<template #icon>
						<i class="bx bx-lock-alt"></i>
					</template>
					<template v-if="getProgress < 40 && password !== ''" #message-danger>
						<p>{{ $t('pages.register.index.fields.password.tooWeak') }}</p>
					</template>
					<template v-else-if="getProgress < 80 && password !== ''" #message-warn>
						<p v-if="getProgress < 60">{{ $t('pages.register.index.fields.password.almostGood') }}</p>
						<p v-else>{{ $t('pages.register.index.fields.password.goodEnough') }}</p>
					</template>
					<template v-else-if="getProgress <= 100 && password !== ''" #message-success>
						<p v-if="getProgress < 100">{{ $t('pages.register.index.fields.password.strongPassword') }}</p>
						<p v-else>{{ $t('pages.register.index.fields.password.perfect') }}</p>
					</template>
				</vs-input>
				<div class="checkboxes">
					<div class="checkbox">
						<div>
							<vs-checkbox @click="agreed != agreed" v-model="agreed">
								<p>{{ $t('pages.register.index.fields.checkboxes.userAgreesWithOur') }}</p>
							</vs-checkbox>
						</div>
						<a style="font-size: 0.9rem" class="highlight" @click="openTerms">{{ $t('pages.register.index.fields.checkboxes.termsOfService') }}</a>
					</div>
					<div class="checkbox">
						<div @click="runCaptcha()" class="pointer">
							<vs-checkbox :loading="hCaptcha.checkbox.loading" v-model="hCaptcha.checkbox.checked" id="hCaptcha">
								<p>{{ $t('pages.register.index.fields.checkboxes.notRobot') }}</p>
							</vs-checkbox>
						</div>
					</div>
				</div>
			</form>

			<div class="button">
				<vs-button @click="submit" :loading="loading.register" block>{{ $t('pages.register.index.register') }}</vs-button>
			</div>

			<!-- Terms of service -->
			<vs-dialog class="tos" overflow-hidden not-center v-model="termsWindow">
				<termsOfService />
				<template #footer>
					<div class="footer-dialog">
						<vs-button @click="tosAgree" block>
							{{ $t('pages.register.index.prompts.termsOfService.agreeWithTheseTerms') }}
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
			display_name: 'default',
			email: 'default',
			password: 'default',
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
			if (this.hCaptcha.verified && this.agreed && this.display_name != '' && this.validEmail && this.getProgress >= 60) {
				let address = this.email.replace(/[@.]/g, '-').concat('-', Date.now().toString());
				try {
					const response = await this.$nhost.auth.register({
						email: this.email,
						password: this.password,
						options: {
							userData: {
								display_name: this.display_name,
								agreed: true,
								address: address,
							},
						},
					});
				} catch (e) {
					err = true;
				} finally {
					if (err) {
						setTimeout(() => {
							this.loading.register = false;
						}, 300);
						this.openNotification(this.$t('pages.register.index.notifications.emailInUse.title'), this.$t('pages.register.index.notifications.emailInUse.description'));
						this.inputState.display_name = 'success';
						this.inputState.email = 'danger';
						this.inputState.password = 'success';
					} else {
						this.openNotification(this.$t('pages.register.index.notifications.confirmEmail.title'), this.$t('pages.register.index.notifications.confirmEmail.description'));
						this.$router.replace('/register/success');
					}
				}
			} else {
				if ((!this.hCaptcha.verified || !this.agreed) && this.display_name != '' && this.validEmail && this.getProgress >= 60) {
					this.openNotification(
						this.$t('pages.register.index.notifications.checkBoxesNotFilled.title'),
						this.$t('pages.register.index.notifications.checkBoxesNotFilled.description'),
					);
				} else {
					this.openNotification(this.$t('pages.register.index.notifications.fieldProblems.title'), this.$t('pages.register.index.notifications.fieldProblems.description'));
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
			if (this.display_name == '') {
				this.inputState.display_name = 'danger';
			} else {
				this.inputState.display_name = 'success';
			}

			if (!this.validEmail) this.inputState.email = 'danger';
			else this.inputState.email = 'success';

			if (this.getProgress < 60) this.inputState.password = 'danger';
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
		navTo(path) {
			this.combMenu = false;
			this.$router.replace(path);
		},
	},
	computed: {
		getProgress() {
			let progress = 0;

			// at least one number

			if (/\d/.test(this.password)) {
				progress += 20;
			}

			// at least one capital letter

			if (/(.*[A-Z].*)/.test(this.password)) {
				progress += 20;
			}

			// at menons a lowercase

			if (/(.*[a-z].*)/.test(this.password)) {
				progress += 20;
			}

			// at least one special character

			if (/[^A-Za-z0-9]/.test(this.password)) {
				progress += 20;
			}

			// more than 5 digits

			if (this.password.length >= 8) {
				progress += 20;
			} else {
				progress = 0;
			}

			return progress;
		},
		validEmail() {
			return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email);
		},
	},
};
</script>
