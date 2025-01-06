<template>
	<div class="layout guest" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)">
		<vs-button-group>
			<vs-button @click="toggleLocale" class="icon" transparent icon><i style="width: 2rem; font-size: 1.5rem" class="bx bx-world"></i> </vs-button>
			<vs-button v-show="this.$colorMode.value == 'light'" @click="switchColorMode" class="icon" transparent icon
				><i style="width: 2rem; font-size: 1.5rem" class="bx bx-sun"></i>
			</vs-button>
			<vs-button v-show="this.$colorMode.value == 'dark'" @click="switchColorMode" class="icon" transparent icon
				><i style="width: 2rem; font-size: 1.5rem" class="bx bx-moon"></i>
			</vs-button>
		</vs-button-group>
		<div class="details" style="display: flex; flex-direction: column; align-items: center">
			<p class="text lowlight" style="font-size: 0.75rem">{{ $t('layouts.guest.rightsReserved') }}</p>
			<div class="options" style="display: flex; justify-content: center">
				<p class="option lowlight" style="font-size: 0.75rem; padding: 0.5rem 1rem; cursor: pointer" @click="showCG = true">
					{{ $t('layouts.guest.readCommunityGuidelines') }}
				</p>
				<p class="option lowlight" style="font-size: 0.75rem; padding: 0.5rem 1rem; cursor: pointer" @click="showTOS = true">
					{{ $t('layouts.guest.readTermsOfService') }}
				</p>
				<p class="option lowlight" style="font-size: 0.75rem; padding: 0.5rem 1rem; cursor: pointer" @click="showPP = true">
					{{ $t('layouts.guest.readPrivacyPolicy') }}
				</p>
				<a class="option lowlight" style="font-size: 0.75rem; padding: 0.5rem 1rem; cursor: pointer" href="https://www.cookiesandyou.com/" target="_blank">{{
					$t('layouts.guest.readAboutCookies')
				}}</a>
			</div>
		</div>

		<!-- Terms of service -->
		<vs-dialog class="tos" overflow-hidden not-center v-model="showTOS">
			<termsOfService />
			<template #footer>
				<vs-button block @click="showTOS = false">
					{{ $t('components.legal.cookies.closePrompt') }}
				</vs-button>
			</template>
		</vs-dialog>

		<!-- Privacy Policy -->
		<vs-dialog class="tos" overflow-hidden not-center v-model="showPP">
			<privacyPolicy />
			<template #footer>
				<vs-button block @click="showPP = false">
					{{ $t('components.legal.cookies.closePrompt') }}
				</vs-button>
			</template>
		</vs-dialog>

		<!-- Community Guidelines -->
		<vs-dialog class="tos" overflow-hidden not-center v-model="showCG">
			<communityGuidelines />
			<template #footer>
				<vs-button block @click="showCG = false">
					{{ $t('components.legal.cookies.closePrompt') }}
				</vs-button>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
import termsOfService from '~/components/legal/termsOfService.vue';
import privacyPolicy from '~/components/legal/privacyPolicy.vue';
import communityGuidelines from '~/components/legal/communityGuidelines.vue';
import langList from '~/components/languageList';
import { debounce } from '~/helpers.js';

export default {
	data() {
		return {
			showPP: false,
			showTOS: false,
			showCG: false,
			prompts: {
				language: {
					window: false,
				},
			},
		};
	},
	components: {
		termsOfService,
		privacyPolicy,
		communityGuidelines,
		langList,
	},
	mounted() {
		this.alignThemes();
	},
	methods: {
		toggleLocale() {
			if (this.$i18n.locale == 'en') {
				this.$i18n.locale = 'et';
				this.$i18n.setLocaleCookie('et');
			} else {
				this.$i18n.locale = 'en';
				this.$i18n.setLocaleCookie('en');
			}
		},
		alignThemes() {
			this.$colorMode.preference = this.$vs.setTheme();
		},
		switchColorMode() {
			this.$vs.toggleTheme();
			this.alignThemes();
		},
		navTo: debounce(async function (path) {
			this.prompts.menu = false;
			if (this.$router.history.current.path != path) {
				this.combMenu = false;
				this.$router.replace(path);
			}
		}, 200),
	},
};
</script>
