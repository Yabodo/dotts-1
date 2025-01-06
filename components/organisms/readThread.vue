<template>
	<div>
		<div>
			<create-comment v-model="newComment.message" :threadId="propThread.content.id" :parentId="propThread.parent.id" @created="newComment.message = null" style="width: 100%" />
			<div class="component threadContainer" v-if="messages.length > 0">
				<div class="threadMessageContainer" v-for="(message, i) in messages" :key="message.id" @mouseenter="hoveredMessage = message.id" @mouseleave="hoveredMessage = null">
					<thread-message
						v-if="i == 0 || messages[i - 1].user.id != message.user.id"
						:user="message.user"
						:firstReply="true"
						:time="message.time"
						:message="message.content.json"
					/>
					<thread-message v-else :user="message.user" :time="message.time" :message="message.content.json" />
					<div class="buttons" v-if="hoveredMessage == message.id">
						<div class="edit button" @click="editMessage(message)">
							<i class="bx bx-edit"></i>
						</div>
						<div class="delete button" @click="deleteMessage(message)">
							<i class="bx bx-trash"></i>
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				<i class="bx bx-loader bx-spin bx-rotate-90"></i>
			</div>
		</div>

		<!-- Delete message -->
		<vs-dialog class="prompt" width="300px" not-center v-model="prompts.deleteMessage.visibility">
			<template #header>
				<h3 style="margin-top: 1rem">
					{{ $t('components.organisms.readThread.prompts.deleteMessage.title') }}
				</h3>
			</template>
			<p>{{ $t('components.organisms.readThread.prompts.deleteMessage.warning') }}</p>
			<template #footer>
				<div style="margin: 1rem 0; display: flex; justify-content: space-between">
					<vs-button @click="prompts.deleteMessage.visibility = false" primary>
						{{ $t('components.organisms.readThread.prompts.deleteMessage.cancel') }}
					</vs-button>
					<vs-button @click="onDeleteMessage()" danger border>
						{{ $t('components.organisms.readThread.prompts.deleteMessage.delete') }}
					</vs-button>
				</div>
			</template>
		</vs-dialog>
	</div>
</template>

<script>
/*
Props: ['propThread']
*/

const feedQuery = {
	messages: `
		subscription MyQuery($thread: uuid!, $limit: Int!) {
			messages: comments(order_by: {time: desc_nulls_last}, limit: $limit, 
					where: {
						_or: [
							{thread_id: {_eq: $thread}},
							{content_id: {_eq: $thread}},
						]
					}) {
				id
				content_id
				owner_id
				parent_id
				thread_id
				time
				user {
					id
					display_name
					shortline
					address
					avatar_path
				}
				content {
					id
					json
					link: linkByLink {
						url
						title
						description
						favicon
						image
					}
				}
				thread {
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
	`,
	getNewParent: `
		subscription MyQuery($parent: uuid!, $user: uuid!) {
			newParent: comments(order_by: {time: asc_nulls_last}, limit: 1, where: {_and: [
					{owner_id: {_eq: $user}},
					{thread_id: {_neq: $parent}},
					{parent_id: {_eq: $parent}},
				]}) {
				id
			}
		}
	`,
};

import gql from 'graphql-tag';
import threadTeaser from '~/components/molecules/threadTeaser.vue';
import threadTitle from '~/components/molecules/threadTitle.vue';
import threadMessage from '~/components/molecules/threadMessage.vue';
import createComment from '~/components/organisms/createComment.vue';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { UPDATE_COMMENT, DELETE_COMMENT } from '~/store/queries/comment.js';

export default {
	components: {
		threadTeaser,
		threadTitle,
		threadMessage,
		createComment,
	},
	data: function () {
		return {
			data: false,
			feedLimit: 10,
			messages: [],
			nextParent: null,
			hoveredMessage: null,
			newComment: {
				message: null,
			},
			prompts: {
				deleteMessage: {
					visibility: false,
					id: null,
				},
			},
		};
	},
	props: ['propThread'],
	computed: {
		threadTitleUser() {
			if (this.messages.length > 0) {
				if (this.propThread.user.id != this.$nhost.auth.currentUser.id) return this.user;
				else return this.messages[0].thread.user;
			} else return '';
		},
	},
	methods: {
		profileUrl() {
			if (this.propThread.user.id == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + this.propThread.user.id;
		},
		async editMessage(message) {},
		deleteMessage(message) {
			this.prompts.deleteMessage.visibility = true;
			this.prompts.deleteMessage.message = message;
			this.$apollo.subscriptions.newParent.skip = false;
		},
		async onDeleteMessage() {
			let deletedMessage = this.prompts.deleteMessage.message;
			if (this.nextParent.length > 0 && deletedMessage.thread_id == deletedMessage.parent_id) {
				const response2 = await this.$apollo.mutate({
					mutation: UPDATE_COMMENT,
					variables: {
						pk_columns: {
							id: this.nextParent[0].id,
						},
						_set: {
							thread_id: deletedMessage.parent_id,
						},
					},
				});
			}
			const response = await this.$apollo.mutate({
				mutation: DELETE_COMMENT,
				variables: {
					id: deletedMessage.id,
				},
			});
			this.prompts.deleteMessage.visibility = false;
			this.prompts.deleteMessage.id = null;
			this.$apollo.subscriptions.newParent.skip = true;
		},
	},
	apollo: {
		$subscribe: {
			messages: {
				query: gql(feedQuery.messages),
				variables() {
					// Use vue reactive properties here
					return {
						thread: this.propThread.content_id,
						limit: this.feedLimit,
					};
				},
				result({ data }) {
					this.messages = data.messages;
				},
				skip: false,
				debounce: 200,
			},
			newParent: {
				query: gql(feedQuery.getNewParent),
				variables() {
					// Use vue reactive properties here
					return {
						parent: this.propThread.parent.id,
						user: this.$nhost.auth.currentUser.id,
					};
				},
				result({ data }) {
					this.nextParent = data.newParent;
				},
				skip: true,
				debounce: 200,
			},
		},
	},
};
</script>
