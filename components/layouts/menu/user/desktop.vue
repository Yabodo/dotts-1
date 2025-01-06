<template>
	<div>
		<div v-if="user">
			<detailedProfile
				:propId="user.id"
				:avatar_path="user.avatar_path"
				:display_name="user.display_name"
				:address="user.address"
				:shortline="user.shortline"
				:socials="user.socials"
				@clicked="profileClick($event)"
			/>
			<div style="padding-bottom: 3rem" v-if="user.walls.length > 0 || user.rooms.length > 0 || hasContacts">
				<div class="list">
					<div class="header">
						<h3>{{ $t('components.layouts.menu.user.desktop.rooms.title') }}</h3>
						<i @click="prompts.room.active = true" class="bx bx-plus button"></i>
					</div>
					<div v-if="user.rooms.length == 0">
						<NuxtLink class="highlighted bubbleButton" to="/read">
							{{ $t('components.layouts.menu.user.desktop.rooms.read') }}
						</NuxtLink>
					</div>
					<div v-if="user.rooms.length > 0">
						<NuxtLink class="highlighted bubbleButton" to="/read">
							{{ $t('components.layouts.menu.user.desktop.rooms.readAll') }}
						</NuxtLink>
					</div>
					<div v-if="user.rooms.length > 0">
						<div v-for="room in user.rooms" :key="room.id">
							<NuxtLink class="bubbleButton" :to="`/read/room/${room.id}`">
								{{ room.name }}
							</NuxtLink>
						</div>
					</div>
					<div v-else>
						<p>{{ $t('components.layouts.menu.user.desktop.rooms.description') }}</p>
						<p>{{ $t('components.layouts.menu.user.desktop.rooms.helper') }}</p>
					</div>
				</div>
				<div class="list">
					<div class="header">
						<h3>{{ $t('components.layouts.menu.user.desktop.walls.title') }}</h3>
						<i @click="prompts.createWall = true" class="bx bx-plus button"></i>
					</div>
					<div v-if="user.walls.length > 0">
						<div v-for="wall in user.walls" :key="wall.id">
							<NuxtLink class="bubbleButton" :to="`/read/wall/${wall.id}`">
								<i v-if="wall.visibility == 'public'" class="bx bx-podcast icon"></i>
								<i v-else-if="wall.visibility == 'personal'" class="bx bx-group icon"></i>
								<i v-else-if="wall.visibility == 'private'" class="bx bxs-no-entry icon"></i>
								{{ wall.name }}
							</NuxtLink>
						</div>
					</div>
					<div v-else>
						<p>{{ $t('components.layouts.menu.user.desktop.walls.description') }}</p>
						<p>{{ $t('components.layouts.menu.user.desktop.walls.helper') }}</p>
					</div>
				</div>
				<div style="display: flex; flex-direction: column">
					<p class="text lowlight" style="font-size: 0.75rem">{{ $t('layouts.guest.rightsReserved') }}</p>
					<div class="options" style="display: flex; flex-direction: column">
						<p class="option lowlight" style="font-size: 0.75rem; cursor: pointer" @click="$emit('showCG', true)">
							{{ $t('layouts.guest.readCommunityGuidelines') }}
						</p>
						<p class="option lowlight" style="font-size: 0.75rem; cursor: pointer" @click="$emit('showTOS', true)">
							{{ $t('layouts.guest.readTermsOfService') }}
						</p>
						<p class="option lowlight" style="font-size: 0.75rem; cursor: pointer" @click="$emit('showPP', true)">
							{{ $t('layouts.guest.readPrivacyPolicy') }}
						</p>
						<a class="option lowlight" style="font-size: 0.75rem; cursor: pointer" href="https://www.cookiesandyou.com/" target="_blank">{{
							$t('layouts.guest.readAboutCookies')
						}}</a>
					</div>
				</div>
			</div>
			<div class="actionBar" style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%)">
				<vs-button-group>
					<vs-button @click="$emit('toggleLocale', true)" class="icon" transparent icon><i style="width: 2rem; font-size: 1.5rem" class="bx bx-world"></i> </vs-button>
					<vs-button v-show="this.$colorMode.value == 'light'" @click="$emit('switchColorMode', true)" class="icon" transparent icon
						><i style="width: 2rem; font-size: 1.5rem" class="bx bx-sun"></i>
					</vs-button>
					<vs-button v-show="this.$colorMode.value == 'dark'" @click="$emit('switchColorMode', true)" class="icon" transparent icon
						><i style="width: 2rem; font-size: 1.5rem" class="bx bx-moon"></i>
					</vs-button>
				</vs-button-group>
			</div>
		</div>

		<!-- User settings -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.settings.active">
			<h3 class="header">
				{{ $t('pages.profile.index.prompts.settings.title') }}
			</h3>
			<div class="section">
				<h4 class="header">
					{{ $t('pages.profile.index.prompts.settings.password.title') }}
				</h4>
				<div class="body">
					<vs-input
						class="field"
						block
						type="password"
						:placeholder="$t('pages.profile.index.prompts.settings.password.current')"
						:label="$t('pages.profile.index.prompts.settings.password.current')"
						v-model="password.old"
						@click-icon="password.visible.old = !password.visible.old"
						:visiblePassword="password.visible.old"
					>
						<template #icon>
							<i class="bx bx-key"></i>
						</template>
					</vs-input>
					<vs-input
						class="field"
						block
						type="password"
						:placeholder="$t('pages.profile.index.prompts.settings.password.new')"
						:label="$t('pages.profile.index.prompts.settings.password.new')"
						v-model="password.new"
						:progress="getPasswordStrength"
						@click-icon="password.visible.new = !password.visible.new"
						:visiblePassword="password.visible.new"
					>
						<template #icon>
							<i class="bx bx-lock-alt"></i>
						</template>
						<template v-if="getPasswordStrength < 40 && password.new !== ''" #message-danger>
							<p>{{ $t('pages.register.index.fields.password.tooWeak') }}</p>
						</template>
						<template v-else-if="getPasswordStrength < 80 && password.new !== ''" #message-warn>
							<p v-if="getPasswordStrength < 60">{{ $t('pages.register.index.fields.password.almostGood') }}</p>
							<p v-else>{{ $t('pages.register.index.fields.password.goodEnough') }}</p>
						</template>
						<template v-else-if="getPasswordStrength <= 100 && password.new !== ''" #message-success>
							<p v-if="getPasswordStrength < 100">{{ $t('pages.register.index.fields.password.strongPassword') }}</p>
							<p v-else>{{ $t('pages.register.index.fields.password.perfect') }}</p>
						</template>
					</vs-input>
					<vs-input
						class="field"
						block
						type="password"
						:placeholder="$t('pages.profile.index.prompts.settings.password.newAgain')"
						:label="$t('pages.profile.index.prompts.settings.password.newAgain')"
						v-model="password.new2"
						@click-icon="password.visible.new2 = !password.visible.new2"
						:visiblePassword="password.visible.new2"
						@keydown.enter="changePassword()"
					>
						<template #icon>
							<i class="bx bx-lock-alt"></i>
						</template>
						<template v-if="password.new2.length == password.new.length && password.new2 != password.new" #message-danger>
							<p>{{ $t('pages.profile.index.prompts.settings.password.newAgainMismatch') }}</p>
						</template>
						<template v-if="password.new2.length > 0 && password.new2.length == password.new.length && password.new2 == password.new" #message-success>
							<p>{{ $t('pages.profile.index.prompts.settings.password.newAgainMatch') }}</p>
						</template>
					</vs-input>
					<vs-button class="button" @click="changePassword()">
						{{ $t('pages.profile.index.prompts.settings.password.save') }}
					</vs-button>
				</div>
			</div>
			<div class="section">
				<h4 class="header">
					{{ $t('pages.profile.index.prompts.settings.email.title') }}
				</h4>
				<div class="body">
					<vs-input
						class="field"
						block
						type="email"
						:placeholder="$t('pages.profile.index.prompts.settings.email.current')"
						:label="$t('pages.profile.index.prompts.settings.email.current')"
						v-model="email.old"
					>
						<template #icon>
							<i class="bx bx-envelope-open"></i>
						</template>
					</vs-input>
					<vs-input
						class="field"
						block
						type="email"
						:placeholder="$t('pages.profile.index.prompts.settings.email.new')"
						:label="$t('pages.profile.index.prompts.settings.email.new')"
						v-model="email.new"
						@keydown.enter="changeEmail()"
					>
						<template #icon>
							<i class="bx bx-envelope"></i>
						</template>
					</vs-input>
					<vs-button class="button" @click="changeEmail()">
						{{ $t('pages.profile.index.prompts.settings.email.save') }}
					</vs-button>
				</div>
			</div>
		</vs-dialog>

		<!-- Create room -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.room.active">
			<textMutator @submit="createRoom($event)" :placeholder="$t('pages.profile.index.prompts.room.placeholder')" :title="$t('pages.profile.index.prompts.room.title')" />
		</vs-dialog>

		<!-- Update name -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.displayName">
			<textMutator @submit="updateDisplayName($event)" :placeholder="$t('pages.profile.index.prompts.name.placeholder')" :title="$t('pages.profile.index.prompts.name.title')" />
		</vs-dialog>

		<!-- Update shortline -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.shortline">
			<textMutator
				@submit="updateShortline($event)"
				:placeholder="$t('pages.profile.index.prompts.shortline.placeholder')"
				:title="$t('pages.profile.index.prompts.shortline.title')"
			/>
		</vs-dialog>

		<!-- Update address -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.address">
			<textMutator @submit="updateAddress($event)" :placeholder="$t('pages.profile.index.prompts.address.placeholder')" :title="$t('pages.profile.index.prompts.address.title')" />
		</vs-dialog>

		<!-- Update avatar -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.avatar">
			<imageMutator
				@submit="updateAvatar($event)"
				:choose="$t('pages.profile.index.prompts.avatar.choose')"
				:save="$t('pages.profile.index.prompts.avatar.save')"
				:title="$t('pages.profile.index.prompts.avatar.title')"
			/>
		</vs-dialog>

		<!-- Update socials -->
		<vs-dialog class="prompt" width="300px" not-center v-if="user" v-model="prompts.socials">
			<h4 class="header">
				{{ $t('pages.profile.index.prompts.socials.title') }}
			</h4>
			<div v-if="user.socials.length > 0">
				<div v-for="social in user.socials" :key="social.id">
					<img :src="social.link.favicon" alt="" />
					<p>{{ social.link.title }}</p>
				</div>
			</div>
			<textMutator @submit="addSocialLink($event)" :placeholder="$t('pages.profile.index.prompts.socials.placeholder')" />
		</vs-dialog>

		<!-- Create a new wall -->
		<vs-dialog width="300px" not-center prevent-close v-model="prompts.createWall">
			<template #header>
				<h4 class="not-margin">
					{{ $t('components.organisms.createWall.header') }}
				</h4>
			</template>

			<div class="con-content">
				<create-wall ref="createWall" @newWalls="fetchWalls()" />
			</div>

			<template #footer>
				<div style="display: flex; justify-content: space-between">
					<vs-button block @click="createWall">
						{{ $t('components.organisms.createWall.ok') }}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<style lang="css" src="~/assets/css/pages/profile.css"></style>

<script>
import textMutator from '~/components/mutators/textMutator';
import imageMutator from '~/components/mutators/imageMutator';
import gql from 'graphql-tag';
import { mapActions } from 'vuex';
import detailedProfile from '~/components/molecules/profileDetailed.vue';
import createWall from '~/components/organisms/createWall.vue';
import { throttle } from '~/helpers';

const feedQuery = {
	hasContacts: `
		subscription MyQuery($user: uuid!) {
			hasContacts: contacts(limit: 1, where: { user_id: { _eq: $user } }) {
				time
			}
		}
	`,
};

export default {
	layout: 'dashboard',
	nhostAuth: true,
	components: {
		textMutator,
		imageMutator,
		detailedProfile,
		createWall,
	},
	data: () => ({
		message: null,
		rand: 0,
		hasContacts: false,
		walls: {
			before: [],
			after: [],
		},
		room: {
			walls: [],
		},
		user: null,
		organizer: {
			button: false,
		},
		password: {
			old: '',
			new: '',
			new2: '',
			visible: {
				old: false,
				new: false,
				new2: false,
			},
		},
		email: {
			old: '',
			new: '',
		},
		prompts: {
			avatar: false,
			shortline: false,
			address: false,
			displayName: false,
			socials: false,
			settings: {
				active: false,
			},
			room: {
				active: false,
				update: false,
				name: '',
			},
			newPost: {
				window: false,
				view: false,
			},
			createWall: false,
		},
		loading: {
			createWall: false,
		},
	}),
	apollo: {
		$subscribe: {
			user: {
				query: gql`
					subscription MyQuery($user: uuid!) {
						users(where: { id: { _eq: $user } }) {
							id
							display_name
							shortline
							created_at
							address
							avatar_path
							socials {
								id
								link {
									favicon
									title
								}
							}
							rooms(order_by: { name: asc_nulls_last }) {
								id
								name
							}
							walls(order_by: { name: asc_nulls_last }) {
								id
								name
								visibility
							}
						}
					}
				`,
				variables() {
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.user = data.users[0];
				},
			},
			hasContacts: {
				query: gql(feedQuery.hasContacts),
				variables() {
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					if (data.hasContacts.length != 0) this.hasContacts = true;
					else this.hasContacts = false;
				},
			},
		},
	},
	beforeMount() {
		this.rand = Date.now();
	},
	methods: {
		logout() {
			this.$nhost.auth.logout().then(() => {
				this.$router.push(this.$nhost.$options.routes.logout);
			});
		},
		async updateAvatar(file) {
			let validated = false;
			const allowedExtensions = ['jpg', 'jpeg', 'png'];
			const fileExtension = file.name.split('.').pop();
			let error = '';

			//Validating
			if (file.size <= 5000000) validated = true;
			else error.concat(this.$t('pages.profile.index.notifications.avatarError.fileSize'));
			if (allowedExtensions.includes(fileExtension)) validated = true;
			else error.concat(this.$t('pages.profile.index.notifications.avatarError.fileSize'));

			//Running script
			if (validated) {
				let avatarName = `${this.$nhost.auth.currentUser.id}___${Date.now()}`;
				const response = await this.$nhost.storage.put(`/public/avatar/${avatarName}`, file);
				let response2 = await this.$apollo.mutate({
					mutation: gql`
                                mutation MyMutation {
                                    update_users_by_pk(pk_columns: {id: "${this.$nhost.auth.currentUser.id}"}, _set: {avatar_path: "${avatarName}"}) {
                                        avatar_path
                                    }
                                }
                            `,
				});
				this.user.avatar_path = avatarName;
				this.openNotification(this.$t('pages.profile.index.notifications.avatarUpdated.title'), this.$t('pages.profile.index.notifications.avatarUpdated.description'));
			} else {
				this.openNotification(this.$t('pages.profile.index.notifications.avatarError.title'), error);
			}
			this.prompts.avatar = false;
		},
		async getUser() {
			const response = await this.$apollo.query({
				query: gql`
                        query MyQuery($_me: uuid = "${this.$nhost.auth.currentUser.id}") {
                            users(where: {id: {_eq: $_me}}) {
                                display_name
                                avatar_path
                                shortline
                                address
                                walls {
                                    id
                                    name
                                }
                            }
                            room_walls(where: {wall: {owner: {_eq: $_me}}, _and: {user_id: {_eq: $_me}}}, distinct_on: wall_id) {
                                wall_id
                                room_id
                            }
                        }
                    `,
			});
			this.user = response.data.users[0];
			response.data.room_walls.forEach((el) => {
				this.walls.before.push(el.wall_id);
				this.walls.after.push(el.wall_id);
			});
		},
		setMessage(message) {
			this.message = message;
			setTimeout(() => {
				this.message = null;
			}, 2000);
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
		profileClick($event) {
			switch ($event) {
				case 'display_name':
					this.prompts.displayName = true;
					break;

				case 'avatar':
					this.prompts.avatar = true;
					break;

				case 'shortline':
					this.prompts.shortline = true;
					break;

				case 'address':
					this.prompts.address = true;
					break;

				case 'socials':
					this.prompts.socials = true;
					break;

				case 'logout':
					this.logout();
					break;

				case 'settings':
					this.prompts.settings.active = true;
					break;

				default:
					break;
			}
		},
		async createRoom(name) {
			if (typeof name == 'string') {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                insert_rooms_one(object: {name: "${name}"}) {
                                    id
                                    name
                                    active
                                }
                            }
                        `,
				});
				// do what you want with data
				this.prompts.room.active = false;
			}
		},
		async updateAddress(input) {
			//const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			var regex = /^\S*$/;
			let validated = false;
			if (typeof input == 'string' && input.length <= 50 && input.length > 0 && regex.test(input)) validated = true;
			if (validated) {
				try {
					let response = await this.$apollo.mutate({
						mutation: gql`
                                mutation MyMutation {
                                    update_users_by_pk(pk_columns: {id: "${this.$nhost.auth.currentUser.id}"}, _set: {address: "${input}"}) {
                                        address
                                    }
                                }
                            `,
					});
				} catch (err) {
					this.openNotification(this.$t('pages.profile.index.notifications.addressTaken.title'), this.$t('pages.profile.index.notifications.addressTaken.description'));
					return;
				}
				this.prompts.address = false;
				this.openNotification(this.$t('pages.profile.index.notifications.addressUpdated.title'), this.$t('pages.profile.index.notifications.addressUpdated.description'));
				this.$apollo.subscriptions.user.refresh();
			} else
				this.openNotification(this.$t('pages.profile.index.notifications.addressWrongFormat.title'), this.$t('pages.profile.index.notifications.addressWrongFormat.description'));
		},
		async updateShortline(input) {
			let validated = false;
			if (typeof input == 'string' && input.length <= 50) validated = true;
			if (validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                update_users_by_pk(pk_columns: {id: "${this.$nhost.auth.currentUser.id}"}, _set: {shortline: "${input}"}) {
                                    shortline
                                }
                            }
                        `,
				});
				this.prompts.shortline = false;
				this.openNotification(this.$t('pages.profile.index.notifications.shortlineUpdated.title'), this.$t('pages.profile.index.notifications.shortlineUpdated.description'));
				this.$apollo.subscriptions.user.refresh();
			} else this.openNotification(this.$t('pages.profile.index.notifications.shortlineTooLong.title'), this.$t('pages.profile.index.notifications.shortlineTooLong.description'));
		},
		async updateDisplayName(input) {
			let validated = false;
			if (typeof input == 'string' && input.length <= 50 && input.length >= 1) validated = true;
			if (validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                update_users_by_pk(pk_columns: {id: "${this.$nhost.auth.currentUser.id}"}, _set: {display_name: "${input}"}) {
                                    display_name
                                }
                            }
                        `,
				});
				this.prompts.displayName = false;
				this.$apollo.subscriptions.user.refresh();
				this.openNotification(this.$t('pages.profile.index.notifications.displayNameUpdated.title'), this.$t('pages.profile.index.notifications.displayNameUpdated.description'));
			} else
				this.openNotification(
					this.$t('pages.profile.index.notifications.displayNameWrongFormat.title'),
					this.$t('pages.profile.index.notifications.displayNameWrongFormat.description'),
				);
		},
		async addSocialLink(url) {},
		createWall: throttle(async function () {
			if (this.loading.createWall == false) {
				this.loading.createWall = true;
				const result = await this.$refs.createWall.create();
				this.prompts.createWall = false; //if post() fails, prompt stays open
				this.loading.createWall = false;
			}
			return;
		}, 1000),
		fetchWalls: throttle(async function () {
			this.$apollo.subscriptions.user.refresh();
			return;
		}, 1000),
		async changePassword() {
			let err = false;
			if (this.getPasswordStrength >= 60 && this.password.new == this.password.new2) {
				try {
					const response = await this.$nhost.auth.changePassword(this.password.old, this.password.new);
				} catch (e) {
					err = true;
				} finally {
					if (!err) {
						this.openNotification(
							this.$t('pages.profile.index.notifications.password.passwordChanged.title'),
							this.$t('pages.profile.index.notifications.password.passwordChanged.description'),
						);
						this.$router.replace('/');
					} else {
						this.openNotification(
							this.$t('pages.profile.index.notifications.password.passwordNotChanged.title'),
							this.$t('pages.profile.index.notifications.password.passwordNotChanged.description'),
						);
					}
				}
			} else {
				if (this.password.new == this.password.new2) {
					this.openNotification(
						this.$t('pages.profile.index.notifications.password.weakPassword.title'),
						this.$t('pages.profile.index.notifications.password.weakPassword.description'),
					);
				} else {
					this.openNotification(
						this.$t('pages.profile.index.notifications.password.newPasswordsMismatch.title'),
						this.$t('pages.profile.index.notifications.password.newPasswordsMismatch.description'),
					);
				}
			}
		},
		async changeEmail() {
			let err = false;
			let email = (this.email.new + '').trim();
			if (this.$validator.isEmail(email)) {
				try {
					const response = await this.$nhost.auth.requestEmailChange(email);
				} catch (e) {
					err = true;
				} finally {
					if (!err) {
						this.openNotification(
							this.$t('pages.profile.index.notifications.email.confirmNewEmail.title'),
							this.$t('pages.profile.index.notifications.email.confirmNewEmail.description'),
						);
						this.$router.replace('/');
					} else {
						this.openNotification(this.$t('pages.profile.index.notifications.email.emailTaken.title'), this.$t('pages.profile.index.notifications.email.emailTaken.description'));
					}
				}
			} else {
				this.openNotification(
					this.$t('pages.profile.index.notifications.email.wrongEmailFormat.title'),
					this.$t('pages.profile.index.notifications.email.wrongEmailFormat.description'),
				);
			}
		},
		...mapActions({
			action: 'profile/test',
			avatarUpdate: 'profile/updateAvatar',
		}),
	},
	computed: {
		getPasswordStrength() {
			let progress = 0;
			let password = this.password.new;

			// at least one number
			if (/\d/.test(password)) {
				progress += 20;
			}

			// at least one capital letter
			if (/(.*[A-Z].*)/.test(password)) {
				progress += 20;
			}

			// at menons a lowercase
			if (/(.*[a-z].*)/.test(password)) {
				progress += 20;
			}

			// at least one special character
			if (/[^A-Za-z0-9]/.test(password)) {
				progress += 20;
			}

			// at least 8 digits long
			if (password.length >= 8) {
				progress += 20;
			} else {
				progress = password != '' ? 20 : 0;
			}

			return progress;
		},
	},
};
</script>
