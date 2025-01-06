<template>
	<div class="recoverEmail">
		<div class="wrapper">
			<h3>{{ $t('pages.security.newEmail._token.pageTitle') }}</h3>
			<div class="form">
				<div class="checkboxes">
					<div class="checkbox">
						<div>
							<vs-checkbox @click="agreed != agreed" v-model="agreed">
								<p>{{ $t('pages.security.newEmail._token.userAgreesWithOur') }}</p>
							</vs-checkbox> 
						</div>
						<a style="font-size: 0.9rem" class="text-highlight" @click="openTerms">{{ $t('pages.security.newEmail._token.termsOfService') }}</a>
					</div>
					<div class="checkbox">
						<div @click="runCaptcha()" class="pointer">
							<vs-checkbox :loading="loading.hCaptcha" v-model="hCaptcha.checkbox.checked" id="hCaptcha">
								<p>{{ $t('pages.security.newEmail._token.notRobot') }}</p>
							</vs-checkbox> 
						</div>
					</div>
				</div>
			</div>

			<div class="button">
				<vs-button @click="submit" :loading="loading.updateEmail" block>{{ $t('pages.security.newEmail._token.updateEmail') }}</vs-button>
			</div>

			<!-- Terms of service -->
			<vs-dialog class="tos" overflow-hidden not-center v-model="termsWindow">
				<termsOfService />
				<template #footer>
					<div class="footer-dialog">
						<vs-button @click="tosAgree" block>
							{{ $t('pages.security.newEmail._token.prompts.termsOfService.agreeWithTheseTerms') }}
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
import termsOfService from '~/components/legal/termsOfService.vue'

export default {
  nhostAuth: true,
  data: () => ({
    token: null,
    agreed: false,
	termsWindow: false,
	inputState: {
		agreed: 'default'
	},
	loading: {
		submit: false,
		hCaptcha: false,
	},
	hCaptcha: {
		checkbox: {
			window: false,
			checked: false
		},
		verified: false,
		expired: false,
		token: null,
		eKey: null,
		error: null
	},
	tos: null
  }),
    async asyncData({ params }) {
        const token = params.token // When calling /abc the slug will be "abc"
        return { token }
    },
  components: { 
	  VueHcaptcha,
	  termsOfService
  },
  methods: {
	openTerms() {
		this.tos = this.$t('pages')
		this.termsWindow = true
	},
    async submit() {
		this.loading.submit = true;
		let err = false
		if (this.hCaptcha.verified && this.agreed) {
			try {
				const response = await this.$nhost.auth.confirmEmailChange(this.token);
			}
			catch (e) {
				err = true
			}
			finally {
				if (!err) {
					this.openNotification(this.$t('pages.security.newEmail._token.notifications.emailUpdated.title'), this.$t('pages.security.newEmail._token.notifications.emailUpdated.description'))
					this.$router.replace("/")
				}
				else {
					this.openNotification(this.$t('pages.security.newEmail._token.notifications.emailTokenExpired.title'), this.$t('pages.security.newEmail._token.notifications.emailTokenExpired.description'))
				}
			}
		}
		else {
			this.openNotification(this.$t('pages.security.newEmail._token.notifications.checkBoxesNotFilled.title'), this.$t('pages.security.newEmail._token.notifications.checkBoxesNotFilled.description'))
		}
		this.loading.submit = false;
    },
    openNotification(title, text, color = 'primary', duration = 6000) {
        this.$vs.notification({
            duration: duration,
            position: 'top-center',
            color: color,
            title: title,
            text: text
        })
    },
	checkFields() {
		if(!this.agreed) this.inputState.agreed = 'danger'
		else this.inputState.agreed = 'success'
	},
    async onVerify(token, ekey) {
        this.hCaptcha.token = token;
        this.hCaptcha.eKey = ekey;
		const result = await this.$hVerify(this.hCaptcha.token);
		if(result) {
			this.hCaptcha.verified = true;
			this.hCaptcha.checkbox.loading = false;
			this.hCaptcha.checkbox.checked = true;
		}
		else {
			this.hCaptcha.checkbox.loading = false;
			this.hCaptcha.checkbox.checked = false;
		}
    },
	onExpire() {
		this.loading.hCaptcha = false;
		this.verified = false;
		this.token = null;
		this.eKey = null;
		this.expired = true;
		//console.log('Expired');
	},
	onChallengeExpire() {
		this.loading.hCaptcha = false;
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
		this.loading.hCaptcha = false;
	},
	runCaptcha() {
		this.loading.hCaptcha = true;
		this.$refs.invisibleHcaptcha.execute();
	},
	tosAgree() {
		this.termsWindow = false;
		this.agreed = true;
	}
  },
}
</script>
