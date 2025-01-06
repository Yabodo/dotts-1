<template>
	<div class="container">
		<div v-if="user.room">
			<div id="header">
				<div class="pointer" style="margin: 1rem 0; display: flex; justify-content: space-between; align-items: flex-end">
					<h2 @click="prompts.name = true">{{ user.room.name }}</h2>
					<i @click="openSettings()" class="bx bx-cog" style="font-size: 1.3rem"></i>
				</div>
				<div class="pointer" v-if="intro">
					<p>
						{{ $t('pages.read.room._room.noPosts') }}
					</p>
					<p>
						{{ $t('pages.read.room._room.addWallsForPosts') }}
					</p>
				</div>
			</div>
			<div id="feed">
				<listFeed @empty="intro = $event" @wallsUpdate="feedWallsUpdate($event)" :room="slug" />
			</div>

			<!-- DIALOGS -->
			<!-- Room name settings -->
			<vs-dialog width="300px" class="prompt" overflow-hidden not-center v-model="prompts.name">
				<template #header>
					<h4 :class="{ lowlight: noWallsAdded }" class="not-margin">
						{{ $t('pages.read.room._room.prompts.roomSettings.changeName') }}
					</h4>
				</template>
				<div class="con-content">
					<textMutator @submit="updateRoomName($event)" :placeholder="$t('pages.read.room._room.prompts.roomSettings.changeNamePlaceholder')" />
				</div>
			</vs-dialog>
			<!-- Room settings -->
			<vs-dialog width="300px" class="prompt" overflow-hidden not-center v-model="prompts.settings">
				<template #header>
					<h4 :class="{ lowlight: noWallsAdded }" class="not-margin">
						{{ $t('pages.read.room._room.prompts.roomSettings.title') }}
					</h4>
				</template>
				<div class="section" v-if="user.walls">
					<div v-if="user.walls.length > 0">
						<p v-if="!noWallsAdded" class="header">{{ $t('pages.read.room._room.prompts.roomSettings.roomWalls') }}</p>
						<div style="margin-bottom: 0.5rem" v-else>
							<h3>{{ $t('pages.read.room._room.prompts.roomSettings.pickFirstWalls.title') }}</h3>
							<p class="lowerlight">{{ $t('pages.read.room._room.prompts.roomSettings.pickFirstWalls.description') }}</p>
						</div>
						<roomWallPicker :list="user.walls" @navTo="navTo($event)" :preSelected="walls.after" @update="walls.after = $event" />
						<div>
							<vs-button @click="updateRoom" block style="padding: 0; margin: 0; margin-top: 1rem">
								{{ $t('pages.read.room._room.prompts.roomSettings.update') }}
							</vs-button>
						</div>
					</div>
					<div v-else>
						<div style="margin-bottom: 0.5rem">
							<h3>{{ $t('pages.read.room._room.prompts.roomSettings.findWalls') }}</h3>
							<p class="lowlight">{{ $t('pages.read.room._room.prompts.roomSettings.noWallsFollowed') }}</p>
						</div>
						<user-search />
					</div>
				</div>
				<div class="section">
					<p :class="{ lowlight: noWallsAdded }" class="header">{{ $t('pages.read.room._room.prompts.roomSettings.deleteTitle') }}</p>
					<vs-button @click="onDelete()" danger border>
						{{ $t('pages.read.room._room.prompts.roomSettings.delete') }}
					</vs-button>
				</div>
			</vs-dialog>

			<!-- Room delete confirmation -->
			<vs-dialog class="prompt" width="300px" not-center overflow-hidden v-model="prompts.delete">
				<template #header>
					<h3 style="margin-top: 1rem">{{ $t('pages.read.room._room.prompts.roomDelete.title') }}</h3>
				</template>
				<p>{{ $t('pages.read.room._room.prompts.roomDelete.description') }}</p>
				<template #footer>
					<div style="margin: 1rem 0; display: flex; justify-content: space-between">
						<vs-button @click="prompts.delete = false" primary>
							{{ $t('pages.read.room._room.prompts.roomDelete.cancel') }}
						</vs-button>
						<vs-button @click="deleteRoom()" danger border>
							{{ $t('pages.read.room._room.prompts.roomDelete.delete') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>
		</div>
	</div>
</template>
<script>
import listFeed from '~/components/complexOrganisms/listFeed.vue';
import textMutator from '~/components/mutators/textMutator';
import roomWallPicker from '~/components/molecules/roomWallPicker';
import userSearch from '~/components/organisms/userSearch.vue';
import gql from 'graphql-tag';
import { throttle } from '~/helpers';

export default {
	layout: 'dashboard',
	nhostAuth: true,
	components: {
		textMutator,
		listFeed,
		roomWallPicker,
		userSearch,
	},
	data: () => ({
		slug: null,
		intro: null,
		message: null,
		walls: {
			before: {
				ids: [],
				walls: [],
			},
			after: {
				ids: [],
				walls: [],
			},
			owned: [],
			test: null,
		},
		user: {
			room: null,
			walls: null,
			info: null,
		},
		prompts: {
			name: false,
			settings: false,
			delete: false,
			aboutPost: false,
			newPost: false,
		},
		feed: [],
		noWallsAdded: false,
		postId: null,
		linkPreview: false,
		url: null,
	}),
	async asyncData({ params }) {
		const slug = params.room; // When calling /abc the slug will be "abc"
		return { slug };
	},
	apollo: {
		$subscribe: {
			rooms: {
				query: gql`
					subscription MyQuery($room: uuid!) {
						rooms(where: { id: { _eq: $room } }) {
							id
							name
							active
							room_walls {
								id
								wall_id
								wall {
									id
									name
									description
									owner
									user {
										address
										avatar_path
										display_name
										id
										shortline
									}
								}
							}
						}
					}
				`,
				variables() {
					// Use vue reactive properties here
					return {
						room: this.slug,
					};
				},
				result({ data }) {
					this.user.room = data.rooms[0];
					let wallIds = [];
					let wallInfo = [];
					data.rooms[0].room_walls.forEach((el) => {
						wallIds.push(el.wall_id);
						wallInfo.push(el.wall);
						if (el.wall.owner == this.$nhost.auth.currentUser.id) {
							this.walls.owned.push(el.wall_id);
						}
					});

					this.walls.before.ids = [...new Set(wallIds)];
					this.walls.after.ids = [...new Set(wallIds)];
					this.walls.before.walls = [...new Set(wallInfo)];
					this.walls.after.walls = [...new Set(wallInfo)];
					if (this.walls.before.length == 0) {
						this.prompts.settings = true;
						this.noWallsAdded = true;
					}
					console.log(this.walls);
				},
			},
			walls: {
				query: gql`
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
				variables() {
					// Use vue reactive properties here
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.user.walls = data.walls;
					data.walls.map((wall, i) => {
						this.user.walls[i].label = {
							name: wall.user.display_name,
							link: wall.user.id,
						};
					});
				},
			},
		},
	},
	methods: {
		async updateRoom() {
			let createdObjects = '';
			let removedObjects = '';
			let removed = this.walls.before.ids.filter((x) => !this.walls.after.ids.includes(x));
			let added = this.walls.after.ids.filter((x) => !this.walls.before.ids.includes(x));
			//GQL remove where wall_id _eq removed && room_id _eq _slug
			//GQL add wall_id _eq added && room_id _eq _slug
			if (added.length > 0 || removed.length > 0) {
				removed.forEach((wall, index) => {
					removedObjects = removedObjects.concat(`del${index}: delete_room_walls(where: {room_id: {_eq: "${this.slug}"}, _and: {wall_id: {_eq: "${wall}"}}}) {affected_rows}`);
				});
				if (added.length > 0) {
					added.forEach((wall, index) => {
						createdObjects = createdObjects.concat(`{room_id: "${this.slug}", wall_id: "${wall}"}, `);
						removedObjects = removedObjects.concat(
							`delete${index}: delete_room_walls(where: {user_id: {_eq: "${this.$nhost.auth.currentUser.id}"}, _and: {wall_id: {_eq: "${wall}"}, _and: {_and: {room_id: {_eq: "${this.slug}"}}}}}) {affected_rows}`,
						);
					});
					createdObjects = `insert_room_walls(objects: [${createdObjects}]) {					
                                        returning {
                                            id
                                            room_id
                                            wall_id
                                        }
                                    }`;
				}
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                ${removedObjects}
                                ${createdObjects}
                            }
                        `,
				});
				this.walls.before.ids = [...this.walls.after.ids];
				this.walls.before.walls = [...this.walls.after.walls];
				this.walls.test = 'updateRoom';
				this.openNotification(this.$t('pages.read.room._room.notifications.wallsUpdated.title'), this.$t('pages.read.room._room.notifications.wallsUpdated.description'));
				this.prompts.settings = false;
			} else {
				//this.$router.replace("/organize");
				//this.openNotification('No changes', `No changes were made.`, 'warning');
				this.prompts.settings = false;
			}
		},
		async updateRoomName(input) {
			let validated = false;
			if (typeof input == 'string' && input.length <= 50 && input.length > 0) validated = true;
			if (validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                update_rooms_by_pk(pk_columns: {id: "${this.slug}"}, _set: {name: "${input}"}) {
                                    name
                                }
                            }
                        `,
				});
				this.prompts.settings = false;
				this.openNotification(this.$t('pages.read.room._room.notifications.nameUpdated.title'), this.$t('pages.read.room._room.notifications.nameUpdated.description'));
				this.$apollo.subscriptions.rooms.refresh();
			} else
				this.openNotification(this.$t('pages.read.room._room.notifications.nameWrongFormat.title'), this.$t('pages.read.room._room.notifications.nameWrongFormat.description'));
		},
		onDelete() {
			this.prompts.settings = false;
			this.prompts.delete = true;
		},
		async deleteRoom() {
			const response = await this.$apollo.mutate({
				mutation: gql`
                        mutation MyMutation($id: uuid = "${this.user.room.id}") {
                            delete_room_walls(where: {room_id: {_eq: $id}}) {
                                affected_rows
                            }
                            delete_rooms_by_pk(id: $id) {
                                id
                            }
                        }
                    `,
			});
			this.prompts.delete = false;
			this.openNotification(this.$t('pages.read.room._room.notifications.roomDeleted.title'), this.$t('pages.read.room._room.notifications.roomDeleted.description'));
			this.$router.push('/profile');
		},
		async aboutPost(post) {
			this.postId = this.$stringify(post.id, true);
			this.prompts.aboutPost = true;
		},
		async aboutPostUpdated() {
			this.$apollo.subscriptions.rooms.refresh();
			this.prompts.aboutPost = false;
			this.postId = null;
		},
		async savePost(postLink) {
			this.prompts.newPost = true;
			this.url = this.$stringify(postLink.url, true);
			this.linkPreview = postLink;
		},
		createPost: throttle(async function () {
			const result = await this.$refs.createPost.post();
			this.prompts.newPost = !result; //if post() fails, prompt stays open
			return;
		}, 1000),
		openNotification(title, text, color = 'primary', duration = 3000) {
			this.$vs.notification({
				duration: duration,
				position: 'top-center',
				color: color,
				title: title,
				text: text,
			});
		},
		navTo(url) {
			this.$router.push(url);
		},
		async feedWallsUpdate(event) {
			if (event && event.added.length > 0) {
				this.walls.after = [...this.walls.after, ...event.added];
				await this.updateRoom();
				this.$apollo.subscriptions.rooms.refresh();
				this.$apollo.subscriptions.walls.refresh();
			}
		},
		openSettings() {
			this.walls.after.ids = [...this.walls.before.ids];
			this.walls.after.walls = [...this.walls.before.walls];
			this.prompts.settings = true;
		},
	},
};
</script>
