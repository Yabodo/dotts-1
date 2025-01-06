<template>
	<div>
		<div v-if="prompts.menu" style="position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 9999" @click="prompts.menu = false"></div>
		<div v-if="user && rooms" style="position: fixed; z-index: 9999; width: 100%">
			<div class="navbar">
				<div class="actions">
					<a @click="openFeedPicker()" class="button">
						<p>{{ $t('components.layouts.userNavbar.read') }}</p>
					</a>
					<div @click="prompts.menu = !prompts.menu" class="icon">
						<img height="50%" v-show="this.$colorMode.value == 'dark'" src="~/assets/images/white-no-bg.svg" alt="" />
						<img height="50%" v-show="this.$colorMode.value == 'light'" src="~/assets/images/black-no-bg.svg" alt="" />
					</div>
					<a @click="post()" class="button">
						<p>{{ $t('components.layouts.userNavbar.post') }}</p>
					</a>
				</div>
				<div v-show="prompts.menu" class="menu">
					<div class="comb-container comb-toggle-props">
						<svg viewBox="0 0 32 14" xmlns="http://www.w3.org/2000/svg">
							<a class="comb">
								<path d="M8 14L0 0H32L24 14H8Z"></path>
							</a>
						</svg>
						<svg
							class="comb-toggle-icon feather feather-menu"
							xmlns="http://www.w3.org/2000/svg"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</div>
					<div class="navbar-items">
						<div class="comb-container">
							<div class="navbar-bg"></div>
						</div>
						<div class="comb-container comb-container-1">
							<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
								<a @click="navTo('/profile')" class="comb">
									<path d="M24 0H8L0 14L8 28H24L32 14L24 0Z"></path>
								</a>
							</svg>
							<svg
								class="comb-icon feather feather-user"
								xmlns="http://www.w3.org/2000/svg"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
						<div class="comb-container comb-container-2">
							<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
								<a class="comb" @click="openLocaleMenu()">
									<path d="M24 0H8L0 14L8 28H24L32 14L24 0Z"></path>
								</a>
							</svg>
							<svg
								class="comb-icon feather feather-globe"
								xmlns="http://www.w3.org/2000/svg"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="2" y1="12" x2="22" y2="12"></line>
								<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
							</svg>
						</div>
						<div v-if="$colorMode.value == 'dark'" class="comb-container comb-container-3">
							<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
								<a @click="switchColorMode()" class="comb">
									<path d="M24 0H8L0 14L8 28H24L32 14L24 0Z"></path>
								</a>
							</svg>
							<svg
								class="comb-icon feather feather-moon"
								xmlns="http://www.w3.org/2000/svg"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
							</svg>
						</div>
						<div v-if="$colorMode.value == 'light'" class="comb-container comb-container-3">
							<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
								<a @click="switchColorMode()" class="comb">
									<path d="M24 0H8L0 14L8 28H24L32 14L24 0Z"></path>
								</a>
							</svg>
							<svg
								class="comb-icon feather feather-sun"
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="5"></circle>
								<line x1="12" y1="1" x2="12" y2="3"></line>
								<line x1="12" y1="21" x2="12" y2="23"></line>
								<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
								<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
								<line x1="1" y1="12" x2="3" y2="12"></line>
								<line x1="21" y1="12" x2="23" y2="12"></line>
								<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
								<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
							</svg>
						</div>
					</div>
				</div>
			</div>
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
				<template #footer>
					<div class="button">
						<vs-button :loading="loading.createPost" @click="createPost()" block>
							{{ $t('components.layouts.userNavbar.prompts.newPost.submit') }}
						</vs-button>
					</div>
				</template>
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

export default {
	//computed: mapGetters(['isAuthenticated'])
	props: ['outsideClick'],
	data: () => {
		return {
			user: null,
			rooms: null,
			prompts: {
				language: {
					window: false,
				},
				newPost: {
					window: false,
					view: false,
				},
				createWall: false,
				feedPicker: false,
				menu: false,
			},
			loading: {
				createWall: false,
				createPost: false,
			},
		};
	},
	components: {
		langList,
		createPost,
		createWall,
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
		openLocaleMenu() {
			this.prompts.language.window = true;
			this.prompts.menu = false;
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
		createPost: throttle(async function () {
			if (this.loading.createPost == false) {
				this.loading.createPost = true;
				const result = await this.$refs.createPost.post();
				this.loading.createPost = false;
			}
			return;
		}, 1000),
		createPosted(result) {
			this.loading.createPost = false;
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
