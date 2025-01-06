<template>
	<div class="container">
		<div v-if="apolloFetched">
			<div v-if="user">
				<div class="post">
					<div class="userRow profile">
						<div class="row">
							<profile
								:displayAddress="true"
								:propId="user.id"
								:avatar_path="user.avatar_path"
								:display_name="user.display_name"
								:address="user.address"
								:shortline="user.shortline"
							/>
						</div>
						<div style="width: 100%; justify-content: flex-end" class="icon-button anim-icon">
							<div v-if="this.isContact == false" style="width: 2rem" @click="addContact()" class="icon-container">
								<i class="bx bxs-user-plus bx-tada"></i>
								<i class="bx bx-user-plus"></i>
							</div>
							<div v-if="this.isContact == true" style="width: 2rem" @click="prompts.userWallPermissions = true" class="icon-container">
								<i class="bx bxs-select-multiple bx-tada"></i>
								<i class="bx bx-select-multiple"></i>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div v-if="user.walls.length > 0">
						<h3 style="padding-bottom: 1rem; font-weight: 400">{{ $t('pages.profile._user.chooseWalls') }}</h3>
						<div>
							<checklistMutator
								:list="user.walls"
								linkPath="/read/wall/"
								:linkName="$t('components.organisms.aboutPost.openWall')"
								@navTo="navTo($event)"
								@change="walls.after = $event"
								:selected="walls.after"
								:key="walls.key"
							/>
						</div>
						<div>
							<vs-button @click="follow" block style="padding: 0; margin: 0; margin-top: 1rem">
								{{ $t('pages.profile._user.submitWalls') }}
							</vs-button>
						</div>
					</div>
					<div v-else>
						{{ $t('pages.profile._user.noWallsAvailable') }}
					</div>
				</div>
			</div>

			<!-- DIALOGS -->
			<!-- Add a first contact? -->
			<vs-dialog overflow-hidden width="300px" not-center v-model="prompts.addFirstContact">
				<div style="margin-top: 2rem">
					<h3>{{ $t('pages.profile._user.prompts.addFirstContact.title') }}</h3>
					<p class="lowerlight">{{ $t('pages.profile._user.prompts.addFirstContact.description') }}</p>
					<div style="margin: 0.5rem 0">
						<vs-button @click="addContact()" block>{{ $t('pages.profile._user.prompts.addFirstContact.addContact') }}</vs-button>
						<vs-button @click="$router.push('/read')" flat block>{{ $t('pages.profile._user.prompts.addFirstContact.goToRead') }}</vs-button>
					</div>
				</div>
			</vs-dialog>

			<!-- Manage _user permissions -->
			<vs-dialog not-center v-if="user" v-model="prompts.userWallPermissions">
				<h3 class="not-margin lowlight">
					{{ $t('pages.profile._user.prompts.contactSettings.title') }}
				</h3>
				<userWallPermissions @createWall="prompts.createWall = true" :propId="user.id" @submit="prompts.userWallPermissions = false" />
				<div style="margin-top: 2rem">
					<p class="lowlight">{{ $t('pages.profile._user.prompts.contactSettings.removeContact') }}</p>
					<vs-button @click="removeContact()" border danger style="padding: 0; margin: 0; margin-top: 1rem">
						{{ $t('pages.profile._user.prompts.contactSettings.remove') }}
					</vs-button>
				</div>
			</vs-dialog>

			<!-- Create a new wall -->
			<vs-dialog overflow-hidden not-center v-model="prompts.createWall">
				<template #header>
					<h4 class="not-margin">
						{{ $t('components.organisms.createWall.header') }}
					</h4>
				</template>

				<div class="con-content">
					<create-wall ref="createWall" propPrivacy="personal" @newWalls="fetchWalls()" />
				</div>

				<template #footer>
					<div style="display: flex; justify-content: space-between">
						<vs-button @click="createWall" border>
							{{ $t('components.organisms.createWall.ok') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>
		</div>
	</div>
</template>

<style lang="css" src="~/assets/css/pages/dashboard.css"></style>

<script>
import profile from '~/components/molecules/profile.vue';
import userWallPermissions from '~/components/prompts/userWallPermissions.vue';
import createWall from '~/components/organisms/createWall.vue';
import checklistMutator from '~/components/mutators/checklistMutator';
import gql from 'graphql-tag';
import { throttle } from '~/helpers';

const feedQuery = {
	userHasWalls: `
		subscription MyQuery($user: uuid!) {
			userHasWalls: walls(limit: 1, where: { owner: { _eq: $user } }) {
				id
			}
		}
	`,
	profile: `
		subscription MyQuery($other: uuid!) {
			profile: users(where: { id: { _eq: $other } }) {
				id
				display_name
				avatar_path
				shortline
				address
				walls {
					id
					name
				}
			}
		}
	`,
	roomWalls: `
		subscription MyQuery($other: uuid!, $user: uuid!) {
			room_walls(where: { wall: { owner: { _eq: $other } }, _and: { user_id: { _eq: $user } } }, distinct_on: wall_id) {
				wall_id
				room_id
			}
		}
	`,
	walls: `
		subscription MyQuery($user: uuid!) {
			walls(where: { room_walls: { user_id: { _eq: $user } } }) {
				id
				name
				user {
					id
					display_name
					address
				}
			}
		}
	`,
	isContact: `
		subscription MyQuery($other: uuid!, $user: uuid!) {
			isContact: contacts(limit: 1, where: { contact_id: { _eq: $other }, _and: { user_id: { _eq: $user } } }) {
				time
			}
		}
	`,
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
		profile,
		userWallPermissions,
		checklistMutator,
		createWall,
	},
	data: () => ({
		apolloFetches: 0, //each $apollo smartQuery & subscription +1's.
		slug: null,
		isContact: null,
		hasContacts: null,
		hasWalls: [],
		walls: {
			key: 0, //component refresh purposes
			before: [],
			after: [],
		},
		room: {
			walls: [],
		},
		user: null,
		prompts: {
			userWallPermissions: false,
			createWall: false,
			addFirstContact: false,
			feedPicker: false,
		},
		loading: {
			createWall: false,
		},
	}),
	async asyncData({ params }) {
		const slug = params.user; // When calling /abc the slug will be "abc"
		return { slug };
	},
	apollo: {
		$subscribe: {
			userHasWalls: {
				query: gql(feedQuery.userHasWalls),
				variables() {
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					if (data.userHasWalls.length != 0) this.hasWalls = true;
					else this.hasWalls = false;
					this.apolloFetches += 1;
				},
			},
			profile: {
				query: gql(feedQuery.profile),
				variables() {
					return {
						other: this.slug,
					};
				},
				result({ data }) {
					this.user = data.profile[0];
					this.apolloFetches += 1;
				},
			},
			roomWalls: {
				query: gql(feedQuery.roomWalls),
				variables() {
					return {
						user: this.$nhost.auth.currentUser.id,
						other: this.slug,
					};
				},
				result({ data }) {
					let walls = [];
					data.room_walls.forEach((el) => {
						walls.push(el.wall_id);
					});
					this.walls.before = [...new Set(walls)];
					this.walls.after = [...new Set(walls)];
					this.apolloFetches += 1;
					this.walls.key = Date.now();
				},
			},
			isContact: {
				query: gql(feedQuery.isContact),
				variables() {
					return {
						user: this.$nhost.auth.currentUser.id,
						other: this.slug,
					};
				},
				result({ data }) {
					if (data.isContact.length != 0) this.isContact = true;
					else this.isContact = false;
					this.apolloFetches += 1;
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
					this.apolloFetches += 1;
				},
			},
		},
	},
	beforeMount() {
		if (this.$nhost.auth.currentUser.id == this.slug) {
			this.$router.replace('/profile');
		}
	},
	mounted() {
		this.apolloFetches = 0;
	},
	methods: {
		follow: throttle(async function () {
			this.$nuxt.$loading.start();
			let createdObjects = '';
			let removedObjects = '';
			let removed = this.walls.before.filter((x) => !this.walls.after.includes(x));
			let added = this.walls.after.filter((x) => !this.walls.before.includes(x));
			if (added.length > 0 || removed.length > 0) {
				if (added.length > 0) {
					added.forEach((wall, index) => {
						createdObjects = createdObjects.concat(`{wall_id: "${wall}"},`);
					});
					createdObjects = `insert_room_walls(objects: [${createdObjects}]) {					
                                        returning {
                                            id
                                            room_id
                                            wall_id
                                        }
                                    }`;
				}
				removed.forEach((wall, index) => {
					removedObjects = removedObjects.concat(`del${index}: delete_room_walls(where: {wall_id: {_eq: "${wall}"}}) {affected_rows} `);
				});
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                ${createdObjects}
                                ${removedObjects}
                            }
                        `,
				});
				this.openNotification(this.$t('pages.profile._user.notifications.allGood.title'), this.$t('pages.profile._user.notifications.allGood.description'));
				if (!this.hasContacts) {
					this.prompts.addFirstContact = true;
				}
				this.$nuxt.$loading.finish();
				return true;
			}
		}, 800),
		addContact: throttle(async function () {
			this.prompts.addFirstContact = false;
			let validated = false;
			//Validate input
			if (this.$nhost.auth.currentUser.id != this.slug) validated = true;
			//Add to contacts
			if (this.isContact == false && validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
						mutation MyMutation($contact: uuid!) {
							insert_contacts(objects: [{ contact_id: $contact }]) {
								returning {
									time
								}
							}
						}
					`,
					variables: {
						contact: this.slug,
					},
				});
				this.openNotification(this.$t('pages.profile._user.notifications.contactAdded.title'), this.$t('pages.profile._user.notifications.contactAdded.description'));
				this.prompts.userWallPermissions = true;
				//this.$apollo.subscriptions.user.refresh();
			} else this.openNotification(this.$t('pages.profile._user.notifications.updateContactValidationError.title'), this.$t('pages.profile._user.notifications.updateContactValidationError.description'), 'danger');
		}, 800),
		removeContact: throttle(async function () {
			let validated = false;
			//Validate input
			if (this.$nhost.auth.currentUser.id != this.slug) validated = true;
			//Remove from contacts
			if (this.isContact == true && validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
						mutation MyMutation($contact: uuid!, $me: uuid!) {
							delete_contacts(where: { contact_id: { _eq: $contact }, _and: { user_id: { _eq: $me } } }) {
								affected_rows
							}
						}
					`,
					variables: {
						contact: this.slug,
						me: this.$nhost.auth.currentUser.id,
					},
				});
				this.openNotification(this.$t('pages.profile._user.notifications.contactRemoved.title'), this.$t('pages.profile._user.notifications.contactRemoved.description'));
				this.prompts.userWallPermissions = false;
				//this.$apollo.subscriptions.user.refresh();
			} else this.openNotification(this.$t('pages.profile._user.notifications.updateContactValidationError.title'), this.$t('pages.profile._user.notifications.updateContactValidationError.description'), 'danger');
		}, 800),
		createWall: throttle(async function () {
			if (this.loading.createWall == false) {
				this.loading.createWall = true;
				const result = await this.$refs.createWall.create();
				this.prompts.createWall = false; //if post() fails, prompt stays open
				this.loading.createWall = false;
			}
			return;
		}, 800),
		fetchWalls: throttle(async function () {
			//this.$apollo.subscriptions.user.refresh();
			this.prompts.createWall = false;
			this.loading.createWall = false;
			return;
		}, 1000),
		openNotification(title, text, color = 'primary', duration = 6000) {
			this.$vs.notification({
				duration: duration,
				position: 'top-center',
				color: color,
				title: title,
				text: text,
			});
		},
		navTo(url) {
			this.prompts.userWallPermissions = false;
			this.$router.push(url);
		},
	},
	computed: {
		apolloFetched: function () {
			let totalQueries = 0;
			let totalSubscriptions = 0;
			if (this.$apollo.hasOwnProperty('subscriptions')) totalSubscriptions = Object.keys(this.$apollo.subscriptions).length;
			if (this.$apollo.hasOwnProperty('queries')) totalQueries = Object.keys(this.$apollo.queries).length;
			let totalFetches = totalSubscriptions + totalQueries;
			if (this.apolloFetches >= totalFetches) {
				return true;
			} else {
				return false;
			}
		},
	},
};
</script>
