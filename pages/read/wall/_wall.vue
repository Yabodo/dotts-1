<template>
	<div class="container">
		<div v-if="wall && user && !$apollo.loading">
			<!-- PAGE CONTENT -->
			<div>
				<div id="header" style="margin: 1rem 0">
					<div v-if="wall.user.id == $nhost.auth.currentUser.id" style="display: flex; justify-content: space-between; align-items: flex-end">
						<h2 class="pointer" @click="prompts.name = true">{{ wall.name }}</h2>
						<div class="pointer" @click="prompts.visibility = true">
							<i class="bx bx-cog" style="font-size: 1.3rem"></i>
						</div>
					</div>
					<div v-else style="display: flex; justify-content: space-between; align-items: flex-end">
						<h2 @click="prompts.name = true">{{ wall.name }}</h2>
					</div>
				</div>
				<div id="feed">
					<listFeed @empty="intro = $event" :wall="slug" />
				</div>
				<div v-if="intro">
					<div v-if="wall.user.id == $nhost.auth.currentUser.id">
						<p>{{ $t('pages.read.wall._wall.yourWallEmpty') }}</p>
					</div>
					<div v-else>
						<p>{{ $t('pages.read.wall._wall.theirWallEmpty') }}</p>
					</div>
				</div>
			</div>
			<!-- DIALOGS -->
			<div>
				<div v-if="wall.user.id == $nhost.auth.currentUser.id">
					<!-- Update wall name -->
					<vs-dialog class="prompt" width="300px" not-center v-model="prompts.name">
						<textMutator
							@submit="updateWallName($event)"
							:title="$t('pages.read.wall._wall.prompts.updateWallName.title')"
							:placeholder="$t('pages.read.wall._wall.prompts.updateWallName.placeholder')"
						/>
					</vs-dialog>

					<!-- Update wall settings -->
					<vs-dialog class="prompt" width="300px" not-center v-model="prompts.visibility">
						<template #header>
							<h4 class="not-margin">
								{{ $t('pages.read.wall._wall.prompts.updateWallSettings.title') }}
							</h4>
						</template>
						<selectMutator
							@change="visibility.after = $event"
							:placeholder="$t('pages.read.wall._wall.prompts.updateWallSettings.typePlaceholder')"
							:options="visibility.options"
							:default="visibility.after"
						/>
						<div class="section">
							<div v-if="visibility.after == 'personal'">
								<div class="header">
									<h4 class="header" style="margin: 0; padding: 0">
										{{ $t('pages.read.wall._wall.prompts.updateWallSettings.allowances.title') }}
									</h4>
									<p>
										{{ $t('pages.read.wall._wall.prompts.updateWallSettings.allowances.description') }}
									</p>
								</div>
								<contact-picker :list="contact.details" @update="permits.after = $event.ids" :preSelected="permits.after" />
							</div>
							<div v-else-if="visibility.after == 'public'">
								{{ $t('pages.read.wall._wall.prompts.updateWallSettings.publicDescription') }}
							</div>
							<div v-else-if="visibility.after == 'private'">
								{{ $t('pages.read.wall._wall.prompts.updateWallSettings.privateDescription') }}
							</div>
						</div>

						<template #footer>
							<div style="display: flex">
								<div style="width: 100%; margin: 0.5rem">
									<vs-button @click="updateWall()" block>
										{{ $t('pages.read.wall._wall.prompts.updateWallSettings.updateWall') }}
									</vs-button>
								</div>
								<div style="width: 100%; margin: 0.5rem">
									<vs-button @click="deleteWall()" block border danger>
										{{ $t('pages.read.wall._wall.prompts.updateWallSettings.deleteWall') }}
									</vs-button>
								</div>
							</div>
						</template>
					</vs-dialog>

					<!-- Delete wall -->
					<vs-dialog class="prompt" width="300px" not-center v-model="prompts.deleteWall">
						<template #header>
							<h3 style="margin-top: 1rem">
								{{ $t('pages.read.wall._wall.prompts.deleteWall.title') }}
							</h3>
						</template>
						<p>{{ $t('pages.read.wall._wall.prompts.deleteWall.description') }}</p>
						<p>{{ $t('pages.read.wall._wall.prompts.deleteWall.warning') }}</p>
						<template #footer>
							<div style="margin: 1rem 0; display: flex; justify-content: space-between">
								<vs-button @click="prompts.deleteWall = false" primary>
									{{ $t('pages.read.wall._wall.prompts.deleteWall.cancel') }}
								</vs-button>
								<vs-button @click="onDeleteWall()" danger border>
									{{ $t('pages.read.wall._wall.prompts.deleteWall.delete') }}
								</vs-button>
							</div>
						</template>
					</vs-dialog>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import listFeed from '~/components/complexOrganisms/listFeed.vue';
import textMutator from '~/components/mutators/textMutator';
import selectMutator from '~/components/mutators/selectMutator';
import feedPost from '~/components/organisms/readPost.vue';
import createPost from '~/components/organisms/createPost.vue';
import updatePost from '~/components/organisms/updatePost.vue';
import aboutPost from '~/components/prompts/aboutPost.vue';
import contactPicker from '~/components/mutators/contactPicker.vue';
import gql from 'graphql-tag';
import { throttle } from '~/helpers';

export default {
	layout: 'dashboard',
	nhostAuth: true,
	components: {
		contactPicker,
		textMutator,
		selectMutator,
		feedPost,
		updatePost,
		aboutPost,
		createPost,
		listFeed,
	},
	data: () => ({
		intro: false,
		slug: null,
		id: null,
		user: null,
		url: null,
		message: null,
		wall: null,
		contact: {
			ids: [],
			details: [],
		},
		permits: {
			before: [],
			after: [],
		},
		prompts: {
			name: false,
			visibility: false,
			updatePost: false,
			deleteWall: false,
			aboutPost: false,
			newPost: false,
		},
		visibility: {
			options: ['public', 'personal', 'private'],
			before: null,
			after: null,
		},
		user: null,
		postId: null,
		linkPreview: false,
	}),
	async asyncData({ params }) {
		const slug = params.wall; // When calling /abc the slug will be "abc"
		return { slug };
	},
	apollo: {
		$subscribe: {
			walls: {
				query: gql`
					query MyQuery($wall: uuid!) {
						wall: walls_by_pk(id: $wall) {
							id
							name
							visibility
							user {
								id
								shortline
								address
								avatar_path
								display_name
							}
							permissions {
								user_id
								user {
									id
									display_name
									avatar_path
									shortline
									address
								}
							}
						}
					}
				`,
				variables() {
					// Use vue reactive properties here
					return {
						wall: this.slug,
					};
				},
				result({ data }) {
					this.wall = data.wall;

					if (this.wall.user.id == this.$nhost.auth.currentUser.id) {
						let permissions = [];
						this.contact.ids = [];
						this.contact.details = [];
						this.visibility.before = this.wall.visibility;
						this.visibility.after = this.wall.visibility;
						this.wall.permissions.forEach((el) => {
							permissions.push(el.user_id);
							this.contact.details.push(el.user);
						});
						this.permits.before = [...new Set(permissions)];
						this.permits.after = [...new Set(permissions)];
					}
				},
			},
			user: {
				query: gql`
					query MyQuery($user: uuid!) {
						user: users_by_pk(id: $user) {
							id
							display_name
							shortline
							address
							avatar_path
							walls {
								id
								name
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
	methods: {
		async updateWallPermits() {
			let createdObjects = '';
			let removedObjects = '';
			let removed = this.permits.before.filter((x) => !this.permits.after.includes(x));
			let added = this.permits.after.filter((x) => !this.permits.before.includes(x));
			//GQL remove where wall_id _eq removed && room_id _eq _slug
			//GQL add wall_id _eq added && room_id _eq _slug
			if (added.length > 0 || removed.length > 0) {
				removed.forEach((user, index) => {
					removedObjects = removedObjects.concat(`del${index}: delete_wall_passes(where: {wall_id: {_eq: "${this.slug}"}, _and: {user_id: {_eq: "${user}"}}}) {affected_rows}`);
				});
				if (added.length > 0) {
					added.forEach((user) => {
						createdObjects = createdObjects.concat(`{wall_id: "${this.slug}", user_id: "${user}"}, `);
					});
					createdObjects = `insert_wall_passes(objects: [${createdObjects}]) {					
                                        returning {
                                            id
                                            user_id
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
				this.permits.before = this.permits.after.slice();
			}
		},
		async updateWallName(input) {
			let validated = false;
			//Validate input
			if (typeof input == 'string' && input.length <= 50 && input.length >= 1) validated = true;
			//Update to preference
			if (validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                update_walls_by_pk(pk_columns: {id: "${this.slug}"}, _set: {name: "${input}"}) {
                                    name
                                }
                            }
                        `,
				});
				this.prompts.name = false;
				this.openNotification(this.$t('pages.read.wall._wall.notifications.wallNameUpdated.title'), this.$t('pages.read.wall._wall.notifications.wallNameUpdated.description'));
				this.$apollo.subscriptions.walls.refresh();
			} else
				this.openNotification(
					this.$t('pages.read.wall._wall.notifications.wallNameWrongFormat.title'),
					this.$t('pages.read.wall._wall.notifications.wallNameWrongFormat.description'),
				);
		},
		async updateVisibility(input = this.visibility.after) {
			let validated = false;
			let options = ['public', 'personal', 'private'];
			//Validate input
			if (options.includes(input) && input != this.visibility.before) validated = true;
			//Update to preference
			if (validated) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation {
                                update_walls_by_pk(pk_columns: {id: "${this.slug}"}, _set: {visibility: "${input}"}) {
                                    visibility
                                }
                            }
                        `,
				});
				this.$apollo.subscriptions.walls.refresh();
			}
			this.prompts.visibility = false;
		},
		updateWall: throttle(async function () {
			const result = await this.updateWallPermits();
			const result2 = await this.updateVisibility();
			this.openNotification(this.$t('pages.read.wall._wall.notifications.wallUpdated.title'), this.$t('pages.read.wall._wall.notifications.wallUpdated.description'));
		}, 2000),
		async editPost(post) {
			//Opens <vs-dialog> and gives props shown below to organisms/updatePost.vue component.
			this.prompts.updatePost = true;
			this.id = this.$stringify(post.id, true);
			//post.link == null can happen
			if (post.link == null) this.url = '';
			else this.url = this.$stringify(post.link.url, true);
			this.message = this.$stringify(post.message);
		},
		async updatePost() {
			const result = await this.$refs.updatePost.update();
			if (result) {
				this.$apollo.subscriptions.walls.refresh();
			}
			this.prompts.updatePost = !result; //if post() fails, prompt stays open
			return;
		},
		deletePost: throttle(async function () {
			const result = await this.$refs.updatePost.delete();
			this.prompts.updatePost = !result; //if post() fails, prompt stays open
			return;
		}, 1000),
		deleteWall() {
			this.prompts.visibility = false;
			this.prompts.deleteWall = true;
		},
		async onDeleteWall() {
			if (this.wall.user.id == this.$nhost.auth.currentUser.id) {
				const response = await this.$apollo.mutate({
					mutation: gql`
                            mutation MyMutation($id: uuid = "${this.wall.id}") {
                                delete_room_walls(where: {wall_id: {_eq: $id}}) {
                                    affected_rows
                                }
                                delete_wall_passes(where: {wall_id: {_eq: $id}}) {
                                    affected_rows
                                }
                                delete_walls_by_pk(id: $id) {
                                    id
                                }
                                delete_posts(where: {wall_id: {_eq: $id}}) {
                                    affected_rows
                                }
                            }
                        `,
				});
				this.prompts.deleteWall = false;
				this.openNotification(this.$t('pages.read.wall._wall.notifications.wallDeleted.title'), this.$t('pages.read.wall._wall.notifications.wallDeleted.description'));
				this.$router.push('/');
			}
		},
		async aboutPost(post) {
			this.postId = this.$stringify(post.id, true);
			this.prompts.aboutPost = true;
		},
		async aboutPostUpdated() {
			this.$apollo.subscriptions.walls.refresh();
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
	},
};
</script>
