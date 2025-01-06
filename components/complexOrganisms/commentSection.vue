<template>
	<div>
		<div v-if="threads.length == 0">
			<create-comment
				@created="newComment.message = null"
				v-if="propPost.user.id != $nhost.auth.currentUser.id"
				v-model="newComment.message"
				:threadId="propPost.id"
				:parentId="propPost.id"
				style="width: 100%"
			/>
		</div>
		<div v-else class="component commentSection">
			<div class="title" @click="showComments = !showComments">
				<p v-if="!showComments && propPost.threads.length > 0">{{ $t('components.complex.commentSection.commentSection') }}</p>
				<div v-if="showComments">
					<p v-if="propPost.user.id != $nhost.auth.currentUser.id">{{ $t('components.complex.commentSection.chatWith') }} {{ propPost.user.display_name }}</p>
					<div v-else>
						<p v-if="threads.length > 1">{{ $t('components.complex.commentSection.hideAllChats') }}</p>
						<p v-if="threads.length <= 1">{{ $t('components.complex.commentSection.chatWith') }} {{ threads[0].user.display_name }}</p>
					</div>
				</div>
			</div>
			<div class="content">
				<div v-if="!showComments && propPost.threads.length > 0" @click="showComments = !showComments">
					<thread-teaser :user="propPost.lastComment[0].content.user" :time="propPost.lastComment[0].content.time" :propJson="propPost.lastComment[0].content.json" />
				</div>
				<div v-else>
					<div v-if="showComments">
						<div v-if="propPost.user.id != $nhost.auth.currentUser.id">
							<div>
								<readThread :propThread="threads[0]" />
							</div>
						</div>
						<div v-if="propPost.user.id == $nhost.auth.currentUser.id">
							<div v-if="threads.length > 1">
								<div v-for="thread in threads" :key="thread.id">
									<div @click="toggleThread(thread.id)">
										<tiny-profile :user="thread.user" :time="thread.time" />
									</div>
									<div v-if="openedThread == thread.id">
										<readThread :propThread="thread" />
									</div>
								</div>
							</div>
							<div v-else>
								<readThread :propThread="threads[0]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import gql from 'graphql-tag';
import tinyProfile from '~/components/molecules/tinyProfile.vue';
import threadTeaser from '~/components/molecules/threadTeaser.vue';
import readThread from '~/components/organisms/readThread.vue';
import youtube from '~/components/molecules/links/youtube.vue';
import createComment from '~/components/organisms/createComment.vue';

const feedQuery = {
	comments: `
		subscription MyQuery($parent: uuid!, $limit: Int!) {
			threads: get_parent_threads(args: {parent: $parent}, limit: $limit, order_by: {time: desc}) {
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
				parent {
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
			}
		}
	`,
};

export default {
	components: {
		tinyProfile,
		threadTeaser,
		readThread,
		youtube,
		createComment,
	},
	data() {
		return {
			feedLimit: 10,
			threads: [],
			showComments: false,
			openedThread: '',
			newComment: {
				message: null,
			},
		};
	},
	props: ['propPost'],
	methods: {
		toggleThread(id) {
			if (this.openedThread == id) {
				this.openedThread = '';
			} else this.openedThread = id;
		},
		log(item) {
			console.log(item);
		},
	},
	computed: {},
	apollo: {
		$subscribe: {
			comments: {
				query: gql(feedQuery.comments),
				variables() {
					// Use vue reactive properties here
					return {
						parent: this.propPost.id,
						limit: this.feedLimit,
					};
				},
				result({ data }) {
					this.threads = data.threads;
				},
			},
		},
	},
};
</script>
