<template>
	<div>
		<div class="post create">
			<profile :propId="user.id" :avatar_path="user.avatar_path" :display_name="user.display_name" :address="user.address" :shortline="user.shortline" />
			<form autocomplete="off">
				<div v-if="new_post.messageAfter != ''" class="field">
					<vs-input block type="text" v-model="new_post.messageAfter" :placeholder="$t('components.organisms.updatePost.message')" class="comment" :shadow="!new_post.preview">
						<template #icon>
							<i class="bx bx-message-dots"></i>
						</template>
					</vs-input>
				</div>
				<message-input v-model="new_post.jsonAfter" style="width: 100%" />
				<div class="field">
					<vs-input block type="url" v-model="new_post.urlAfter" :placeholder="$t('components.organisms.updatePost.link')" :state="new_post.validUrl">
						<template #icon>
							<i class="bx bx-link-alt"></i>
						</template>
					</vs-input>
				</div>
			</form>
			<div style="display: flex; padding: 20px 10px 10px 10px; align-items: center; justify-content: space-between">
				<p style="font-size: 0.9em">{{ $t('components.organisms.updatePost.walls') }}</p>
				<p @click="$emit('newWall', true)" style="font-size: 0.7em; background-color: #141417; color: white; border-radius: 2px; padding: 1px 4px 2px 2px; cursor: pointer">
					{{ $t('components.organisms.updatePost.newWallButton') }}
				</p>
			</div>

			<div v-if="user">
				<checklistMutator
					:list="user.walls"
					linkPath="/read/wall/"
					:linkName="$t('components.organisms.updatePost.settings')"
					@change="walls.after = $event"
					:selected="walls.after"
					@navTo="$emit('navTo', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
/*
props: ["user", "propUrl", "propMessage"]
Execution function: update(), delete()

Docs:
This module doesn't contain the submit button, thus it should be submitted from parent. To submit from parent, use ref to execute update() function.

Example call from parent:

<update-post ref="updatePost" :user="user" :propUrl="url" :propMessage="message">
<button @click="$refs.updatePost.update()" ..>
*/

import gql from 'graphql-tag';
import tagInput from '~/components/organisms/tagInput.vue';
import profile from '~/components/molecules/profile.vue';
import checklistMutator from '~/components/mutators/checklistMutator';
import { throttle, getArrayChanges } from '~/helpers';
import { REMOVE_AND_ADD_POSTS, INSERT_POSTS, DELETE_POSTS, POST_WALLS } from '~/store/queries/post.js';
import { UPDATE_CONTENT, DELETE_CONTENT } from '~/store/queries/content.js';
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
	props: ['user', 'propUrl', 'propMessage', 'propId', 'propJson'],
	data: function () {
		return {
			timedout: {
				createLink: false,
				createPost: false,
			},
			new_post: {
				id: this.propId,
				messageBefore: this.propMessage,
				messageAfter: this.propMessage,
				jsonBefore: this.propJson,
				jsonAfter: this.propJson,
				urlBefore: this.propUrl,
				urlAfter: this.propUrl,
				urlValid: true,
				walls: [],
				content: '',
			},
			posts: null,
			options: [],
			walls: {
				before: [],
				after: [],
			},
		};
	},
	computed: {
		output() {
			if (this.new_post.jsonAfter) {
				return generateHTML(this.new_post.jsonAfter, [StarterKit]);
			} else return this.new_post.jsonAfter;
		},
	},
	methods: {
		logout() {
			this.$nhost.auth.logout().then(() => {
				this.$router.push(this.$nhost.$options.routes.logout);
			});
		},
		stringify(message, url = false) {
			//returns escaped string, decoded url or FALSE
			if (typeof message === 'string') {
				if (url) return decodeURIComponent(message);
				else return this.$validator.unescape(message);
			} else {
				return false;
			}
		},
		async updatePostWalls() {
			let gqlVariables = {
				added: [],
			};
			let removedObjects = {};
			let removedGql = '';
			let removedGqlVariables = '';
			let wallChanges = getArrayChanges(this.walls.before, this.walls.after);

			if (wallChanges.exist && wallChanges.count.after > 0) {
				if (wallChanges.added.length > 0) {
					wallChanges.added.forEach((wall) => {
						gqlVariables.added.push({
							wall_id: wall,
							content_id: this.new_post.id,
						});
					});
				}
				if (wallChanges.removed.length > 0) {
					removedObjects = wallChanges.removed.reduce((a, v, index) => {
						removedGql = removedGql.concat(`del${index}: delete_posts(where: {wall_id: {_eq: $wall${index}}, _and: {content_id: {_eq: $content}}}) {affected_rows}`);
						removedGqlVariables = removedGqlVariables.concat(`$wall${index}: uuid!, `);
						return { ...a, [`wall${index}`]: v };
					}, {});
					gqlVariables = { ...gqlVariables, ...removedObjects, content: this.new_post.id };
					const response = await this.$apollo.mutate({
						mutation: REMOVE_AND_ADD_POSTS(removedGqlVariables, removedGql),
						variables: gqlVariables,
					});
				} else {
					const response = await this.$apollo.mutate({
						mutation: INSERT_POSTS,
						variables: gqlVariables,
					});
				}
				this.walls.before = this.walls.after.slice();
				return true;
			}
			if (this.walls.after.length == 0) {
				this.openNotification(
					this.$t('components.organisms.updatePost.notifications.noWallsPicked.title'),
					this.$t('components.organisms.updatePost.notifications.noWallsPicked.description'),
				);
			}
			return false;
		},
		async updateContent(url, json, id) {
			let gqlObject = {};
			if (url == true) gqlObject.link = null;
			else if (url) gqlObject.link = url;
			if (json == true) gqlObject.json = {};
			else if (json) gqlObject.json = json;

			if (gqlObject != '') {
				const query = UPDATE_CONTENT;
				const response = await this.$apollo.mutate({
					mutation: query,
					variables: {
						pk_columns: { id: id },
						_set: gqlObject,
					},
				});

				return response.data.update_contents_by_pk.id;
			}
			return false;
		},
		async createLink(url) {
			//Validating, sanitizing link and $setLink to DB
			//Returns encoded url, true for "" or false
			url = url.trim();
			if (url != '') {
				if (!url.startsWith('http://') && !url.startsWith('https://') && url != '') {
					url = 'http://'.concat(url);
				}
				if (this.$validator.isURL(url)) {
					//Returns encoded link or false
					const result = await this.$setLink(url);
					if (!result) {
						this.openNotification(
							this.$t('components.organisms.updatePost.notifications.setLinkError.title'),
							this.$t('components.organisms.updatePost.notifications.setLinkError.description'),
							'danger',
						);
					}
					return result;
				}
				return false;
			} else {
				return true;
			}
		},
		async deletePosts(id) {
			const response = await this.$apollo.mutate({
				mutation: DELETE_POSTS,
				variables: {
					id: id,
				},
			});
			return true;
		},
		async deleteContents(id) {
			const response = await this.$apollo.mutate({
				mutation: DELETE_CONTENT,
				variables: {
					id: id,
				},
			});
			return true;
		},
		delete: throttle(async function () {
			let deleted = await this.deletePosts(this.new_post.id);
			deleted = await (deleted && (await this.deleteContents(this.new_post.id)));
			return deleted;
		}),
		async update() {
			let id = false;
			let message = false;
			let text = false;
			let jsonUpdate = false;
			let encodedURL = false;
			let contentUpdated = false;
			let wallsUpdated = false;
			let updated = false;

			//Throttling for at least the timeout duration (milliseconds)
			this.timedout = true;
			const timeout = 200;

			//ID sanitizing
			if (this.new_post.id) {
				id = this.$validator.escape(this.new_post.id + '');
			}
			//Checks message changes. Returns sanitized message or true for ""
			if (this.new_post.messageBefore != this.new_post.messageAfter) {
				if (this.new_post.messageAfter == '') message = true;
				else {
					message = this.$validator.escape(this.new_post.messageAfter + '');
				}
			}
			if (this.output != null && this.output != '' && this.output != '<p></p>') {
				jsonUpdate = this.new_post.jsonAfter;
			} else if (this.output == '' || this.output == '<p></p>') {
				jsonUpdate = true;
			}
			//Fetches URL & sanitizes their preferred URL.
			if (this.new_post.urlBefore != this.new_post.urlAfter) {
				encodedURL = await this.createLink(this.new_post.urlAfter);
				if (!encodedURL) {
					this.openNotification(
						this.$t('components.organisms.updatePost.notifications.badLink.title'),
						this.$t('components.organisms.updatePost.notifications.badLink.description'),
					);
					return false;
				}
			}
			//Function requires sanitized content.
			if (this.output != null && this.output != '' && this.output != '<p></p>') {
				if (this.output.length < 10000) {
					text = true;
				}
			}

			if ((this.$validator.isURL(this.new_post.urlAfter) || (this.new_post.urlAfter == '' && text)) && id) {
				updated = await this.updateContent(encodedURL, jsonUpdate, id);
				contentUpdated = updated;
			}

			wallsUpdated = await this.updatePostWalls();
			if (wallsUpdated) {
				updated = true;
			}

			if (updated) {
				this.openNotification(this.$t('components.organisms.updatePost.notifications.allGood.title'), this.$t('components.organisms.updatePost.notifications.allGood.description'));
				return true;
			} else if (!contentUpdated) {
				this.openNotification(
					this.$t('components.organisms.updatePost.notifications.noLinkNorPost.title'),
					this.$t('components.organisms.updatePost.notifications.noLinkNorPost.description'),
				);
				return true;
			} else {
				return false;
			}
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
		navTo(id) {
			this.prompts.wall.show = false;
			this.$router.replace(id);
		},
	},
	apollo: {
		$subscribe: {
			walls: {
				query: POST_WALLS,
				variables() {
					return {
						post: this.new_post.id,
					};
				},
				result({ data }) {
					if (data.walls.length > 0) {
						data.walls.map((wall) => {
							this.walls.before.push(wall.wall_id);
							this.walls.after.push(wall.wall_id);
						});
					}
				},
			},
		},
	},
};
</script>
