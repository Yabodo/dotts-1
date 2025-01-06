<template>
	<div class="container">
		<div class="introduction" v-if="intro">
			<h2 style="margin: 1rem 0">{{ $t('pages.read.index.findYourFriends') }}</h2>
		</div>
		{{ /* --Welcome message for empty feeds--
			works only with $t('pages.read.index.introduction.paragraphs') format. 
			Better solutions welcomed, but i18n readability can't be sacrificed any further. */ }}

		<div id="feed">
			<listFeed v-if="mounted" @empty="intro = $event" />
		</div>

		<!-- Pick a feed to read -->
		<div class="mobile" v-if="rooms.length > 0">
			<vs-dialog not-center overflow-hidden blur v-model="prompts.feedPicker">
				<div class="list">
					<div class="header">
						<h3>{{ $t('components.layouts.userNavbar.prompts.yourFeeds.title') }}</h3>
					</div>
					<div v-if="rooms.length > 0">
						<div v-for="room in rooms" :key="room.id">
							<a class="bubbleButton" @click="navTo(`/read/room/${room.id}`)">{{ room.name }}</a>
						</div>
					</div>
					<a class="bubbleButton outline lowlight" @click="navTo(`/read`)">{{ $t('components.layouts.userNavbar.prompts.yourFeeds.openCombinedFeed') }}</a>
				</div>
			</vs-dialog>
		</div>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import feedPost from '~/components/organisms/readPost.vue';
import createPost from '~/components/organisms/createPost.vue';
import updatePost from '~/components/organisms/updatePost.vue';
import aboutPost from '~/components/prompts/aboutPost.vue';
import listFeed from '~/components/complexOrganisms/listFeed.vue';

let prevPath = '';

export default {
	layout: 'dashboard',
	nhostAuth: true,
	components: {
		feedPost,
		createPost,
		updatePost,
		aboutPost,
		listFeed,
	},
	data: () => ({
		intro: null,
		prevPath: '',
		prompts: {
			feedPicker: null,
		},
		rooms: [],
		mounted: false,
	}),
	methods: {
		logout() {
			this.$nhost.auth.logout().then(() => {
				this.$router.push(this.$nhost.$options.routes.logout);
			});
		},
		isObject(obj) {
			return Object.prototype.toString.call(obj) === '[object Object]';
		},
		navTo(url) {
			this.$router.push(url);
			this.prompts.feedPicker = false;
		},
	},
	beforeRouteEnter(to, from, next) {
		const previousRoute = from.path || from.fullPath;
		prevPath = previousRoute;
		next();
	},
	mounted() {
		this.prevPath = prevPath;
		if (this.prevPath == '/') {
			this.prompts.feedPicker = true;
			this.$apollo.subscriptions.rooms.skip = false;
		} else {
			this.prompts.feedPicker = false;
		}
		this.mounted = true;
	},
	apollo: {
		$subscribe: {
			rooms: {
				query: gql`
					subscription MyQuery($user: uuid!) {
						rooms(where: { owner: { _eq: $user } }) {
							id
							name
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
					this.rooms = data.rooms;
					if (this.rooms.length == 0) {
						this.prompts.feedPicker = false;
					}
				},
				skip: true,
			},
		},
	},
};
</script>
