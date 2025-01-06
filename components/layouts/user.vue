<template>
	<div class="navigation-container">
		<div v-if="user && rooms" class="navigation">
			<div style="position: fixed; bottom: 0; z-index: 9999; width: 100%">
				<mobile
					class="mobile"
					@openFeedPicker="openFeedPicker()"
					@post="post()"
					@navToProfile="navTo('/profile')"
					@toggleLocale="toggleLocale()"
					@switchColorMode="switchColorMode()"
				/>
			</div>
			<desktop class="desktop" />
			<!-- Create a new wall -->
			<vs-dialog width="300px" overflow-hidden not-center v-model="prompts.createWall">
				<template #header>
					<h4 class="not-margin">
						{{ $t('components.organisms.createWall.header') }}
					</h4>
				</template>

				<div class="con-content">
					<create-wall ref="createWall" @newWalls="fetchWalls()"> </create-wall>
				</div>

				<template #footer>
					<div style="display: flex; justify-content: space-between">
						<vs-button @click="createWall" block>
							{{ $t('components.organisms.createWall.ok') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>
			<!-- Create new post -->
			<vs-dialog not-center overflow-hidden :loading="user == null" prevent-close v-model="prompts.newPost.window">
				<template #header>
					<h4 class="not-margin">
						{{ $t('components.layouts.userNavbar.prompts.newPost.title') }}
					</h4>
				</template>
				<div class="prompt" v-if="user">
					<create-post
						ref="createPost"
						:user="user"
						propUrl=""
						:propView="prompts.newPost.view"
						@newWall="prompts.createWall = true"
						@navTo="navTo($event)"
						@posted="createPosted($event)"
					>
					</create-post>
				</div>
			</vs-dialog>
			<!-- Change language -->
			<vs-dialog v-model="prompts.language.window" auto-width not-padding not-close overflow-hidden>
				<div>
					<vs-select filter placeholder="Filter" v-model="$i18n.locale">
						<vs-option :label="lang.name" v-for="lang in $i18n.locales" :key="lang.code" :value="lang.code" @click="changeLocale(lang.code)">
							{{ lang.name }}
						</vs-option>
					</vs-select>
				</div>
			</vs-dialog>
			<!-- Pick a feed to read -->
			<div v-if="rooms.length > 0">
				<vs-dialog not-center overflow-hidden blur v-model="prompts.feedPicker">
					<div class="list">
						<div class="header">
							<h3>{{ $t('components.layouts.userNavbar.prompts.yourFeeds.title') }}</h3>
						</div>
						<div>
							<div v-for="room in rooms" :key="room.id">
								<a class="bubbleButton" @click="navTo(`/read/room/${room.id}`)">{{ room.name }}</a>
							</div>
						</div>
						<a class="bubbleButton outline lowlight" @click="navTo(`/read`)">{{ $t('components.layouts.userNavbar.prompts.yourFeeds.openCombinedFeed') }}</a>
					</div>
				</vs-dialog>
			</div>
		</div>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import langList from '~/components/languageList';
import { mapGetters } from 'vuex';
import { debounce, throttle } from '~/helpers.js';
import createPost from '~/components/organisms/createPost.vue';
import createWall from '~/components/organisms/createWall.vue';
import mobile from '~/components/layouts/menu/user/mobile.vue';
import desktop from '~/components/layouts/menu/user/desktop.vue';

export default {
	//computed: mapGetters(['isAuthenticated'])
	props: ['outsideClick', 'propCreatePost'],
	data() {
		return {
			user: null,
			rooms: null,
			prompts: {
				language: {
					window: false,
				},
				newPost: {
					window: this.propCreatePost,
					view: false,
				},
				createWall: false,
				feedPicker: false,
				actionBar: false,
				menu: false,
			},
			loading: {
				createWall: false,
			},
		};
	},
	components: {
		langList,
		createPost,
		createWall,
		mobile,
		desktop,
	},
	mounted() {
		this.alignThemes();
	},
	methods: {
		changeLocale(locale) {
			this.$i18n.locale = locale;
			this.$i18n.setLocaleCookie(locale);
		},
		alignThemes() {
			this.$colorMode.preference = this.$vs.setTheme();
		},
		switchColorMode() {
			this.$vs.toggleTheme();
			this.alignThemes();
		},
		toggleLocale() {
			if (this.$i18n.locale == 'en') {
				this.$i18n.locale = 'et';
				this.$i18n.setLocaleCookie('et');
			} else {
				this.$i18n.locale = 'en';
				this.$i18n.setLocaleCookie('en');
			}
		},
		fetchWalls: throttle(async function () {
			this.$apollo.subscriptions.user.refresh();
			return;
		}, 1000),
		createWall: throttle(async function () {
			if (this.loading.createWall == false) {
				this.loading.createWall = true;
				const result = await this.$refs.createWall.create();
				this.prompts.createWall = false; //if post() fails, prompt stays open
				this.loading.createWall = false;
			}
			return;
		}, 1000),
		createPosted(result) {
			this.prompts.newPost.window = !result;
		},
		navTo: throttle(async function (path) {
			this.prompts.language.window = false;
			this.prompts.newPost.window = false;
			this.prompts.createWall = false;
			this.prompts.feedPicker = false;
			this.prompts.menu = false;
			if (this.$router.history.current.path != path) {
				this.$router.push(path);
			}
			return;
		}, 200),
		post() {
			this.prompts.menu = false;
			this.prompts.newPost.view = 'post';
			this.prompts.newPost.window = true;
		},
		openFeedPicker() {
			if (this.rooms.length == 0) {
				this.navTo('/read');
			} else {
				this.prompts.menu = false;
				this.prompts.feedPicker = true;
			}
		},
	},
	apollo: {
		$subscribe: {
			rooms: {
				query: gql`
					subscription MyQuery($user: uuid!) {
						rooms(where: { owner: { _eq: $user } }) {
							id
							name
						}
					}
				`,
				variables() {
					// Use vue reactive properties here
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.rooms = data.rooms;
				},
			},
			user: {
				query: gql`
					subscription MyQuery($user: uuid!) {
						user: users_by_pk(id: $user) {
							id
							display_name
							address
							shortline
							avatar_path
							walls {
								id
								name
								visibility
							}
						}
					}
				`,
				variables() {
					// Use vue reactive properties here
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.user = data.user;
				},
			},
		},
	},
};
</script>
