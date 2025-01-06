<template>
	<div>
		<div v-if="walls" class="component createPost post">
			<form @submit.prevent autocomplete="off">
				<div v-if="new_post.plain != '' || new_post.url.length > 0" style="margin-bottom: 1rem">
					<div
						v-if="!showAllRoomWalls && new_post.wall.ids.length > 0"
						style="display: flex; flex-wrap: wrap-reverse; justify-content: flex-end; max-width: fit-content; min-width: 100%; position: relative"
					>
						<span
							@click="togglePostWall(wall)"
							v-for="wall in new_post.wall.details"
							:key="wall.id"
							:class="{ selected: new_post.wall.ids.includes(wall.id) }"
							class="vs-select__chips__chip"
						>
							<p>{{ wall.name }}</p>
						</span>
						<div v-if="new_post.wall.ids.length > 0" @click="showAllRoomWalls = !showAllRoomWalls" style="font-size: 1.5rem">
							<i class="bx bx-dots-horizontal-rounded bx-flip-vertical"></i>
						</div>
					</div>
					<div v-else style="display: flex; flex-wrap: wrap; justify-content: flex-end; max-width: fit-content; min-width: 100%; position: relative">
						<span @click="togglePostWall(wall)" v-for="wall in walls" :key="wall.id" :class="{ selected: new_post.wall.ids.includes(wall.id) }" class="vs-select__chips__chip">
							<p>{{ wall.name }}</p>
						</span>
						<div v-if="new_post.wall.ids.length > 0" @click="showAllRoomWalls = !showAllRoomWalls" style="font-size: 1.5rem">
							<i class="bx bx-dots-horizontal-rounded bx-flip-vertical"></i>
						</div>
					</div>
				</div>
				<div v-if="!new_post.preview && (new_post.url.length > 0 || new_post.showUrlField)" class="field" style="margin: 0.5rem 0">
					<vs-input type="url" block v-model.trim="new_post.url" :placeholder="$t('components.organisms.createPost.link')" class="link" :state="new_post.validUrl">
						<template #icon>
							<i class="bx bx-link-alt"></i>
						</template>
					</vs-input>
				</div>
				<div style="display: flex; align-items: center">
					<message-input @input="new_post.json = $event" @plain="new_post.plain = $event" :value="new_post.json" style="width: 100%; margin: 0.5rem 0" />
					<div v-if="new_post.plain != '' || new_post.url.length > 0" class="sendButton" style="margin-left: 0.5rem">
						<vs-button :loading="loading.createPost" @click="submitPost()" icon flat border>
							<i class="bx bxs-paper-plane"></i>
						</vs-button>
					</div>
				</div>
				<div v-if="new_post.preview" class="url">
					<div class="link">
						<div class="bar titleBar">
							<img style="height: 16px" v-if="new_post.preview.favicon" :src="$stringify(new_post.preview.favicon, true)" alt="" />
							<p v-if="new_post.preview.title">{{ $stringify(new_post.preview.title, true) }}</p>
							<p v-else>{{ $stringify(new_post.preview.url, true) }}</p>
						</div>
						<div class="bar descBar">
							<p v-if="new_post.preview.description">{{ $stringify(new_post.preview.description, true) }}</p>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
/*
props: ["user", "propUrl", "propPreview"]
Execution function: post()

Docs:
This module doesn't contain the submit button, thus it should be submitted from parent. To submit from parent, use ref to execute post() function.

Example call from parent:

<create-post ref="createPost" :user="user" :propUrl="url" :propPreview="false">
<button @click="$refs.createPost.post()" ..>
*/

import gql from 'graphql-tag';
import axios from '@nuxtjs/axios';
import tagInput from '~/components/organisms/tagInput.vue';
import profile from '~/components/molecules/profile.vue';
import checklistMutator from '~/components/mutators/checklistMutator';
import { debounce, throttle, getUniqueListBy } from '~/helpers';
import { INSERT_POSTS } from '~/store/queries/post.js';
import { INSERT_CONTENT } from '~/store/queries/content.js';
import { READ_USER_WALLS, READ_OWNED_INROOM_ROOM_WALLS } from '~/store/queries/user.js';
import messageInput from '~/components/molecules/messageInput.vue';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export default {
	layout: 'dashboard',
	nhostAuth: true,
	components: {
		tagInput,
		profile,
		checklistMutator,
		messageInput,
	},
	props: {
		user: Object,
		propUrl: String,
		propPreview: {
			type: Object,
			default: null,
			required: false,
		},
		propView: {
			type: String,
			default: 'post',
			required: false,
		},
	},
	data: function () {
		return {
			content: null,
			walls: null,
			view: this.propView,
			preSelected: null,
			timedout: {
				createLink: false,
				createPost: false,
			},
			new_post: {
				json: null,
				url: this.propUrl,
				urlValid: true,
				preview: this.propPreview,
				wall: {
					ids: [],
					details: [],
				},
				content: '',
				showUrlField: false,
				plain: '',
				inRoom: [],
				exRoom: [],
			},
			posts: null,
			prompts: {
				wall: {
					show: false,
					update: false,
					name: '',
					visibility: 'public', //public,personal,private
				},
			},
			loading: {
				createPost: false,
			},
			options: [],
			slug: null,
			pageType: null,
			roomWallsCount: 0,
			showAllRoomWalls: true,
		};
	},
	computed: {
		selectedWalls: function () {
			return this.walls.slice(0, this.new_post.wall.ids.length);
		},
	},
	methods: {
		submitPost: throttle(async function () {
			const result = await this.post();
			return;
		}, 2000),
		getSlugAndType() {
			if (this.$nuxt.context.params.hasOwnProperty('room')) {
				return { type: 'room', slug: this.$nuxt.context.params.room };
			} else if (this.$nuxt.context.params.hasOwnProperty('wall')) {
				return { type: 'wall', slug: this.$nuxt.context.params.wall };
			} else return { type: null, slug: null };
		},
		setPageInfo() {
			let { type, slug } = this.getSlugAndType();
			this.slug = slug;
			this.pageType = type;
		},
		logout() {
			this.$nhost.auth.logout().then(() => {
				this.$router.push(this.$nhost.$options.routes.logout);
			});
		},
		async createContent(url, json) {
			let contentObject = {};
			if (this.$validator.isURL(url)) contentObject.link = encodeURIComponent(url);
			if (json != null) contentObject.json = json;
			if (contentObject.hasOwnProperty('json') || contentObject.hasOwnProperty('link')) {
				const query = INSERT_CONTENT;
				const response = await this.$apollo.mutate({
					mutation: query,
					variables: {
						object: contentObject,
					},
				});
				// do what you want with data
				this.new_post.content = response.data.insert_contents_one.id;
			}
		},
		async createPost() {
			let postObject = [];
			this.new_post.wall.ids.forEach((wall) => {
				postObject.push({
					content_id: this.$validator.escape(this.new_post.content),
					wall_id: wall,
				});
			});
			const response = await this.$apollo.mutate({
				mutation: INSERT_POSTS,
				variables: {
					added: postObject,
				},
			});
			// do what you want with data
			return response.data.insert_posts.returning;
		},
		async preSelectRoomWalls() {
			let user_id = this.$nhost.auth.currentUser.id;
			let { type, slug } = this.getSlugAndType();
			if (type == 'room') {
				const response = await this.$apollo.query({
					query: READ_OWNED_INROOM_ROOM_WALLS,
					variables: {
						user_id: user_id,
						room_id: slug,
					},
				});
				this.new_post.wall.ids = [...response.data.inRoom, ...response.data.exRoom];
				this.new_post.wall.ids = this.new_post.wall.ids.map((x) => {
					return { id: x.wall.id, name: x.wall.name, visibility: x.wall.visibility };
				});
				this.new_post.wall.ids = getUniqueListBy(this.new_post.wall.ids, 'id');
				return response;
			}
			return null;
		},
		async createLink(url) {
			if (!this.timedout.createLink) {
				//Validating, sanitizing and encoding URL, $setLink to DB, throttle
				if (this.$validator.isURL(url)) {
					this.timedout = false;
					const result = await this.$setLink(url);
				} else {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.badLink.title'),
						this.$t('components.organisms.createPost.notifications.badlink.description'),
					);
					this.new_post.urlValid = false;
				}
			}
		},
		post: throttle(async function () {
			this.loading.createPost = true;
			var createdPosts = null;
			var text = false;
			var messageHTML = '';
			if (this.new_post.json) {
				messageHTML = generateHTML(this.new_post.json, [StarterKit]);
			}
			//Setting command's minimum frequency(milliseconds)
			const timeout = 200;
			//URL standardization and making sure it's not empty
			let url = this.new_post.url.trim();
			if (!url.startsWith('http://') && !url.startsWith('https://') && url != '') {
				url = 'http://'.concat(url);
			}
			if (messageHTML != null && messageHTML != '' && messageHTML != '<p></p>') {
				if (messageHTML.length < 10000) {
					text = true;
				}
			}
			//Walls are required, one or both of url and message have to be there. Wrongly formatted URLs result in error
			if (this.new_post.wall.ids.length > 0 && (this.$validator.isURL(url) || (url == '' && text))) {
				//Throttling for at least the timeout duration
				this.timedout = true;
				if (this.$validator.isURL(url)) await this.createLink(url);
				await this.createContent(url, this.new_post.json);
				createdPosts = await this.createPost();
				//Throttle
				setTimeout(() => {
					this.timedout = false;
				}, timeout);
				this.openNotification(this.$t('components.organisms.createPost.notifications.allGood.title'), this.$t('components.organisms.createPost.notifications.allGood.description'));
				this.$emit('posted', true);
				this.new_post.json = null;
				this.new_post.url = '';
				this.new_post.urlValid = true;
				this.new_post.preview = null;
				this.new_post.content = '';
				this.new_post.showUrlField = false;
				this.new_post.plain = '';

				this.loading.createPost = false;
				return true;
			}
			//Error handling
			else {
				if (this.new_post.url == '' && (messageHTML == '<p></p>' || messageHTML == '' || messageHTML == null)) {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.noLinkNorPost.title'),
						this.$t('components.organisms.createPost.notifications.noLinkNorPost.description'),
					);
				} else if (!this.$validator.isURL(url)) {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.badLink.title'),
						this.$t('components.organisms.createPost.notifications.badLink.description'),
					);
				} else if (messageHTML.length > 10000) {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.messageTooLong.title'),
						this.$t('components.organisms.createPost.notifications.messageTooLong.description'),
					);
				} else if (url.length > 10000) {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.urlTooLong.title'),
						this.$t('components.organisms.createPost.notifications.urlTooLong.description'),
					);
				} else {
					this.openNotification(
						this.$t('components.organisms.createPost.notifications.noWallsPicked.title'),
						this.$t('components.organisms.createPost.notifications.noWallsPicked.description'),
					);
				}
				this.$emit('posted', false);

				this.loading.createPost = false;
				return false;
			}
		}, 2000),
		openNotification(title, text, color = 'primary', duration = 6000) {
			this.$vs.notification({
				duration: duration,
				position: 'top-center',
				color: color,
				title: title,
				text: text,
			});
		},
		navTo(id) {
			this.prompts.wall.show = false;
			this.$emit('navTo', id);
		},
		updateSubscriptions() {
			if (this.pageType == 'room') {
				this.$apollo.subscriptions.walls.skip = true;
				this.$apollo.subscriptions.roomWalls.skip = false;
			} else {
				this.$apollo.subscriptions.walls.skip = false;
				this.$apollo.subscriptions.roomWalls.skip = true;
			}
		},
		togglePostWall(wall) {
			const index = this.new_post.wall.ids.indexOf(wall.id);
			if (index > -1) {
				this.new_post.wall.ids.splice(index, 1); // 2nd parameter means remove one item only
				this.new_post.wall.details.splice(index, 1); // 2nd parameter means remove one item only
			} else {
				this.new_post.wall.ids.push(wall.id);
				this.new_post.wall.details.push(wall);
			}
			let wallCount = this.new_post.wall.ids.length;
			this.roomWallsCount = wallCount;
			if (wallCount == 0 && !this.showAllRoomWalls) {
				this.showAllRoomWalls = true;
			}
		},
	},
	watch: {
		$route(to, from) {
			this.setPageInfo();
			this.updateSubscriptions();
		},
		'new_post.json': function (to, from) {
			if (this.new_post.url == '') {
				let isLink = this.$validator.isURL(this.new_post.plain);
				if (isLink) {
					this.new_post.url = this.new_post.plain;
					this.new_post.json = null;
					this.new_post.plain = null;
					this.new_post.showUrlField = true;
				}
			}
		},
	},
	mounted() {
		this.setPageInfo();
		this.updateSubscriptions();
	},
	apollo: {
		$subscribe: {
			walls: {
				query: READ_USER_WALLS,
				variables() {
					// Use vue reactive properties here
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.walls = data.walls;
				},
				skip: true,
				debounce: 300,
			},
			roomWalls: {
				query: READ_OWNED_INROOM_ROOM_WALLS,
				variables() {
					// Use vue reactive properties here
					return {
						user_id: this.$nhost.auth.currentUser.id,
						room_id: this.slug,
					};
				},
				result({ data }) {
					let walls = [...data.inRoom, ...data.exRoom];
					walls = walls.map((x) => {
						return { id: x.wall.id, name: x.wall.name, visibility: x.wall.visibility };
					});
					walls = getUniqueListBy(walls, 'id');
					this.roomWallsCount = data.inRoom.length;
					this.walls = walls;
					this.new_post.wall = { ids: [], details: [] };
					data.inRoom.forEach((wall, index) => {
						this.new_post.wall.ids.push(wall.wall.id);
						this.new_post.wall.details.push(wall.wall);
					});
					if (this.new_post.wall.ids.length > 0) {
						this.showAllRoomWalls = false;
					}
				},
				skip: true,
				debounce: 300,
			},
			ownedInRoomRoomWalls: {
				query: READ_OWNED_INROOM_ROOM_WALLS,
				variables() {
					// Use vue reactive properties here
					return {
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.walls = data.walls;
					this.preSelectRoomWalls();
				},
				skip: true,
			},
		},
	},
};
</script>
