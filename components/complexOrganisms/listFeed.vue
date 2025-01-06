<template>
	<div>
		<div id="feed" v-if="user">
			<div v-if="feed.length > 0">
				<div v-for="(post, index) in feed" :key="index">
					<feedPost :propPost="post" @savePost="savePost($event)" @editPost="editPost($event)" @aboutPost="aboutPost($event)" />
				</div>
			</div>

			<!-- DIALOGS -->
			<!-- Update post url or message -->
			<vs-dialog overflow-hidden not-center prevent-close v-model="prompts.updatePost">
				<template #header>
					<h4 class="not-margin">
						{{ $t('components.complex.listFeed.prompts.editPost.title') }}
					</h4>
				</template>

				<div class="con-content">
					<update-post
						ref="updatePost"
						:user="user"
						:propUrl="url"
						:propMessage="message"
						:propJson="json"
						:propId="id"
						@newWall="prompts.createWall = true"
						@navTo="navTo($event)"
					/>
				</div>

				<template #footer>
					<div style="display: flex">
						<div style="width: 100%; margin: 0.5rem">
							<vs-button @click="updatePost()" :loading="loading.updatePost" block>
								{{ $t('components.complex.listFeed.prompts.editPost.update') }}
							</vs-button>
						</div>
						<div style="width: 100%; margin: 0.5rem">
							<vs-button @click="deletePost" :loading="loading.deletePost" block border danger>
								{{ $t('components.complex.listFeed.prompts.editPost.delete') }}
							</vs-button>
						</div>
					</div>
				</template>
			</vs-dialog>

			<!-- Create a new post from link -->
			<vs-dialog overflow-hidden not-center prevent-close v-model="prompts.newPost.window">
				<template #header>
					<h4 class="not-margin" v-if="prompts.newPost.view == 'post'">
						{{ $t('components.complex.listFeed.prompts.newPost.title') }}
					</h4>
					<h4 class="not-margin" v-if="prompts.newPost.view == 'walls'">
						{{ $t('components.complex.listFeed.prompts.newPost.chooseWalls') }}
					</h4>
				</template>

				<div class="con-content">
					<create-post
						ref="createPost"
						:user="user"
						:propUrl="url"
						:propPreview="linkPreview"
						:propView="prompts.newPost.view"
						@newWall="prompts.createWall = true"
						@navTo="navTo($event)"
						@posted="createPosted($event)"
					/>
				</div>

				<template #footer>
					<div class="button">
						<vs-button @click="createPost()" :loading="loading.createPost" block>
							{{ $t('components.complex.listFeed.prompts.newPost.submit') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>

			<!-- About post -->
			<vs-dialog overflow-hidden not-center v-model="prompts.aboutPost">
				<about-post :roomId="room" :propId="id" @change="aboutPostChange($event)" @navTo="navTo($event)" />
			</vs-dialog>

			<!-- Create a new wall -->
			<vs-dialog overflow-hidden width="300px" not-center v-model="prompts.createWall">
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
						<vs-button @click="createWall" border>
							{{ $t('components.organisms.createWall.ok') }}
						</vs-button>
					</div>
				</template>
			</vs-dialog>

			<!-- Create room -->
			<vs-dialog class="prompt" width="300px" overflow-hidden not-center v-model="prompts.createRoom">
				<textMutator
					style="margin: 1rem 0"
					@submit="createRoom($event)"
					:title="$t('components.complex.listFeed.prompts.createRoom.title')"
					:placeholder="$t('components.complex.listFeed.prompts.createRoom.placeholder')"
				/>
				<p>{{ $t('components.complex.listFeed.prompts.createRoom.description') }}</p>
			</vs-dialog>
		</div>
		<div class="loading" v-if="feedLoader">
			<i class="bx bx-loader bx-spin bx-rotate-90"></i>
		</div>
	</div>
</template>

<script>
/* 
props: [String:"room"]
emits: [Boolean:""]

Docs:
This Complex organism returns an infinity feed of all walls user follows (by default) or the feed of a single room.

Example call from parent:

<listFeed ref="createPost" :user="user" :propUrl="url" :propPreview="false">
<button @click="$refs.createPost.post()" ..>
*/

import gql from 'graphql-tag';
import feedPost from '~/components/organisms/readPost.vue';
import createPost from '~/components/organisms/createPost.vue';
import updatePost from '~/components/organisms/updatePost.vue';
import createWall from '~/components/organisms/createWall.vue';
import aboutPost from '~/components/prompts/aboutPost.vue';
import textMutator from '~/components/mutators/textMutator.vue';
import { throttle } from '~/helpers';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const feedQuery = {
	default: `
		subscription MyQuery($limit: Int!) {
			feed: contents(limit: $limit, order_by: {time: desc_nulls_last}, where: {posts: {wall: {room_walls: {room_id: {_is_null: true}}}}}) {
				id
				message
				json
				link: linkByLink {
					url
					title
					description
					favicon
					image
					iframe
				}
				time
				user {
					id
					display_name
					shortline
					address
					avatar_path
				}
				threads: commentsByThreadId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
				lastComment: commentsByParentId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
			}
		}
	`,
	room: `
		subscription MyQuery($room: uuid!, $limit: Int!) {
			feed: contents(limit: $limit, order_by: {time: desc_nulls_last}, where: {posts: {wall: {room_walls: {room_id: {_eq: $room}}}}}) {
				id
				message
				json
				link: linkByLink {
					url
					title
					description
					favicon
					image
					iframe
				}
				time
				user {
					id
					display_name
					shortline
					address
					avatar_path
				}
				threads: commentsByThreadId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
				lastComment: commentsByParentId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
			}
		}
	`,
	wall: `
		subscription MyQuery($wall: uuid!, $limit: Int!) {
			feed: contents(limit: $limit, order_by: {time: desc_nulls_last}, where: {posts: {wall_id: {_eq: $wall}}}) {
				id
				message
				json
				link: linkByLink {
					url
					title
					description
					favicon
					image
					iframe
				}
				time
				user {
					id
					display_name
					shortline
					address
					avatar_path
				}
				threads: commentsByThreadId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
				lastComment: commentsByParentId(limit: 1, order_by: {time: desc_nulls_last}) {
					content {
						id
						message
						json
						link: linkByLink {
							url
							title
							description
							favicon
							image
							iframe
						}
						time
						user {
							id
							display_name
							shortline
							address
							avatar_path
						}
					}
				}
			}
		}
	`,
};

export default {
	components: {
		feedPost,
		createPost,
		updatePost,
		aboutPost,
		createWall,
		textMutator,
	},
	props: {
		room: {
			type: String,
			required: false,
			default: '',
		},
		wall: {
			type: String,
			required: false,
			default: '',
		},
	},
	data: () => ({
		user: false, //current user
		id: false, //ID of a selected post
		url: '',
		message: '',
		json: '',
		linkPreview: false,
		feedLimit: 10,
		feed: [],
		feedLoader: false,
		prompts: {
			newPost: {
				window: false,
				view: false,
			},
			updatePost: false,
			aboutPost: false,
			createWall: false,
			createRoom: false,
		},
		loading: {
			createPost: false,
			updatePost: false,
			deletePost: false,
			createWall: false,
			createRoom: false,
		},
	}),
	methods: {
		savePost(postLink) {
			this.prompts.newPost.window = true;
			this.prompts.newPost.view = 'post';
			this.url = this.$stringify(postLink.url, true);
			this.linkPreview = postLink;
		},
		editPost(post) {
			//Opens <vs-dialog> and gives props shown below to organisms/editPost.vue component.
			this.prompts.updatePost = true;
			this.id = this.$stringify(post.id, true);
			//post.link == null can happen
			if (post.link == null) this.url = '';
			else this.url = this.$stringify(post.link.url, true);
			if (post.message) this.message = this.$stringify(post.message);
			else this.message = '';
			this.json = post.json;
		},
		aboutPost(post) {
			this.id = this.$stringify(post.id, true);
			this.prompts.aboutPost = true;
		},
		aboutPostChange(event) {
			this.$emit('wallsUpdate', event);
			this.prompts.aboutPost = false;
		},
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
		updatePost: throttle(async function () {
			if (this.loading.deletePost == false) {
				this.loading.updatePost = true;
				const result = await this.$refs.updatePost.update();
				this.prompts.updatePost = !result; //if post() fails, prompt stays open
				this.loading.updatePost = false;
				this.prompts.updatePost = false;
			}
			return;
		}, 1000),
		deletePost: throttle(async function () {
			if (this.loading.updatePost == false) {
				this.loading.deletePost = true;
				const result = await this.$refs.updatePost.delete();
				this.prompts.updatePost = false; //if post() fails, prompt stays open
				this.loading.deletePost = false;
			}
			return;
		}, 1000),
		deletePost: throttle(async function () {
			if (this.loading.updatePost == false) {
				this.loading.deletePost = true;
				const result = await this.$refs.updatePost.delete();
				this.prompts.updatePost = false; //if post() fails, prompt stays open
				this.loading.deletePost = false;
			}
			return;
		}, 1000),
		createPost: throttle(async function () {
			this.loading.createPost = true;
			const result = await this.$refs.createPost.post();
			return;
		}, 500),
		createPosted(result) {
			this.loading.createPost = false;
			this.prompts.newPost.window = !result;
		},
		createRoom: throttle(async function (name) {
			if (typeof name == 'string' && name.length < 50 && name.length > 0) {
				this.loading.createRoom = true;
				const response = await this.$apollo.mutate({
					mutation: gql`
						mutation MyMutation($name: String!) {
							room: insert_rooms_one(object: { name: $name }) {
								id
								name
								active
							}
						}
					`,
					variables: {
						name: name,
					},
				});
				this.prompts.createRoom = false;
				this.loading.createRoom = false;
				this.$vs.notification({
					progress: 'auto',
					duration: 4000,
					border: 'success',
					position: 'top-center',
					title: this.$t('components.complex.listFeed.notifications.roomCreated.title'),
					text: this.$t('components.complex.listFeed.notifications.roomCreated.description'),
					icon: `<i class='bx bx-folder-open' ></i>`,
					onClick: () => {
						this.navTo(`/read/room/${response.data.room.id}`);
					},
					clickClose: true,
				});
			} else {
				this.openNotification(this.$t('components.complex.listFeed.notifications.nameTooLong.title'), this.$t('components.complex.listFeed.notifications.nameTooLong.description'));
			}
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
		listenScroll: throttle(async function () {
			window.onscroll = () => {
				let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight + 10 > document.documentElement.offsetHeight;
				if (bottomOfWindow && this.feed.length == this.feedLimit) {
					this.feedLoader = true;
					this.feedLimit = this.feedLimit + 10;
					if (this.feedLimit == 20 && this.user.rooms.length == 0) {
						this.$vs.notification({
							progress: 'auto',
							duration: 8000,
							border: 'success',
							position: 'top-center',
							title: this.$t('components.complex.listFeed.notifications.organize.title'),
							text: this.$t('components.complex.listFeed.notifications.organize.description'),
							icon: `<i class='bx bx-folder-open' ></i>`,
							onClick: () => {
								this.prompts.createRoom = true;
							},
							clickClose: true,
						});
					}
				}
			};
		}, 400),
		navTo(url) {
			this.prompts.newPost.window = false;
			this.prompts.updatePost = false;
			this.prompts.aboutPost = false;
			this.prompts.createWall = false;
			this.prompts.createRoom = false;
			this.$router.push(url);
		},
	},
	mounted() {
		this.listenScroll();
	},
	fetch() {
		this.feedLoader = true;
		if (this.room != '') {
			this.$apollo.subscriptions.allWalls.skip = true;
			this.$apollo.subscriptions.wall.skip = true;
			this.$apollo.subscriptions.roomWalls.skip = false;
		} else if (this.wall != '') {
			this.$apollo.subscriptions.allWalls.skip = true;
			this.$apollo.subscriptions.roomWalls.skip = true;
			this.$apollo.subscriptions.wall.skip = false;
		} else {
			this.$apollo.subscriptions.roomWalls.skip = true;
			this.$apollo.subscriptions.wall.skip = true;
			this.$apollo.subscriptions.allWalls.skip = false;
		}
	},
	apollo: {
		$subscribe: {
			allWalls: {
				query: gql(feedQuery.default),
				variables() {
					// Use vue reactive properties here
					return {
						limit: this.feedLimit,
					};
				},
				result({ data }) {
					if (data.feed.length == 0) {
						this.$emit('empty', true);
					} else {
						this.$emit('empty', false);
					}
					this.feedLoader = false;
					this.feed = data.feed;
				},
				skip: true,
				debounce: 200,
			},
			roomWalls: {
				query: gql(feedQuery.room),
				variables() {
					// Use vue reactive properties here
					return {
						room: this.room,
						limit: this.feedLimit,
					};
				},
				result({ data }) {
					if (data.feed.length == 0) {
						this.$emit('empty', true);
					} else {
						this.$emit('empty', false);
					}
					this.feedLoader = false;
					this.feed = data.feed;
				},
				skip: true,
				debounce: 200,
			},
			wall: {
				query: gql(feedQuery.wall),
				variables() {
					// Use vue reactive properties here
					return {
						wall: this.wall,
						limit: this.feedLimit,
					};
				},
				result({ data }) {
					if (data.feed.length == 0) {
						this.$emit('empty', true);
					} else {
						this.$emit('empty', false);
					}
					this.feedLoader = false;
					this.feed = data.feed;
				},
				skip: true,
				debounce: 200,
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
							rooms(limit: 1) {
								id
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
