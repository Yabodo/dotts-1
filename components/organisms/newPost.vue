<template>
	<div>
		<div v-if="walls" class="post create">
			<form autocomplete="off" v-if="propView == 'post'">
				<profile :propId="user.id" :avatar_path="user.avatar_path" :display_name="user.display_name" :address="user.address" :shortline="user.shortline" />

				<message-input v-model="new_post.json" style="width: 100%" />
				<div class="url" v-if="new_post.preview">
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
				<div v-else class="field">
					<vs-input type="url" block v-model.trim="new_post.url" :placeholder="$t('components.organisms.createPost.link')" class="link" :state="new_post.validUrl">
						<template #icon>
							<i class="bx bx-link-alt"></i>
						</template>
					</vs-input>
				</div>
			</form>
			<div v-if="propView == 'walls'">
				<div class="walls">
					<p class="title">{{ $t('components.organisms.createPost.walls') }}</p>
					<i @click="$emit('newWall', true)" class="bx bx-plus button pointer"></i>
				</div>
				<div v-if="walls">
					<checklistMutator
						:list="walls"
						linkPath="/read/wall/"
						:linkName="$t('components.organisms.createPost.settings')"
						@navTo="navTo($event)"
						@change="new_post.walls = $event"
						:selected="new_post.walls"
					/>
				</div>
			</div>
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
import { debounce, throttle } from '~/helpers';
import { INSERT_POSTS } from '~/store/queries/post.js';
import { INSERT_CONTENT } from '~/store/queries/content.js';
import { READ_USER_WALLS } from '~/store/queries/user.js';
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
			default: false,
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
			timedout: {
				createLink: false,
				createPost: false,
			},
			new_post: {
				json: null,
				url: this.propUrl,
				urlValid: true,
				preview: this.propPreview,
				walls: [],
				content: '',
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
			options: [],
		};
	},
	computed: {},
	methods: {
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
			this.new_post.walls.forEach((wall) => {
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
			if (this.new_post.walls.length > 0 && (this.$validator.isURL(url) || (url == '' && text))) {
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
			},
		},
	},
};
</script>
