<template>
	<div>
		<div v-if="prompts.menu" style="position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 9999" @click="prompts.menu = false"></div>
		<div>
			<div class="navbar">
				<div class="actions">
					<a @click="$emit('openFeedPicker', true)" class="button">
						<p>{{ $t('components.layouts.userNavbar.read') }}</p>
					</a>
					<div @click="prompts.actionBar = !prompts.actionBar" class="icon">
						<img height="50%" v-show="this.$colorMode.value == 'dark'" src="~/assets/images/white-no-bg.svg" alt="" />
						<img height="50%" v-show="this.$colorMode.value == 'light'" src="~/assets/images/black-no-bg.svg" alt="" />
					</div>
					<a @click="$emit('post', true)" class="button">
						<p>{{ $t('components.layouts.userNavbar.post') }}</p>
					</a>
				</div>
				<!-- Open base settings -->
				<div class="actionBar" v-if="prompts.actionBar">
					<vs-button-group>
						<vs-button @click="$emit('toggleLocale', true)" class="icon" flat icon><i style="width: 2rem; font-size: 1.5rem" class="bx bx-world"></i> </vs-button>
						<vs-button v-if="this.$colorMode.value == 'light'" @click="$emit('switchColorMode', true)" class="icon" flat icon
							><i style="width: 2rem; font-size: 1.5rem" class="bx bx-sun"></i>
						</vs-button>
						<vs-button v-if="this.$colorMode.value == 'dark'" @click="$emit('switchColorMode', true)" class="icon" flat icon
							><i style="width: 2rem; font-size: 1.5rem" class="bx bx-moon"></i>
						</vs-button>
					</vs-button-group>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import langList from '~/components/languageList';
import { mapGetters } from 'vuex';
import { debounce, throttle } from '~/helpers.js';

export default {
	//computed: mapGetters(['isAuthenticated'])
	props: ['outsideClick'],
	data: () => {
		return {
			prompts: {
				actionBar: false,
			},
		};
	},
	components: {
		langList,
	},
	methods: {},
};
</script>
