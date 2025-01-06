<template>
	<div class="component contactPicker">
		<form @submit.prevent="searchSubmit()" @click="showResults = true" autocomplete="off">
			<vs-input primary v-model="searchQuery" :placeholder="this.$t('components.organisms.userSearch.placeholder')" class="searchBox" />
		</form>
		<div v-if="searchUsers.length > 0 && showResults" class="results">
			<div style="cursor: pointer" @click="navTo(profileUrl(user.id))" class="result" v-for="user in searchUsers" :key="user.id">
				<profile :propId="user.id" :address="user.address" :avatar_path="user.avatar_path" :display_name="user.display_name" :shortline="user.shortline" />
			</div>
			<div style="cursor: pointer" @click="navTo(profileUrl(user.id))" class="result" v-for="user in randomUsers" :key="user.id">
				<profile :propId="user.id" :address="user.address" :avatar_path="user.avatar_path" :display_name="user.display_name" :shortline="user.shortline" />
			</div>
		</div>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import profile from '~/components/molecules/profile.vue';
import { USER_SEARCH } from '~/store/queries/user.js';
import { debounce, throttle, getArrayChanges } from '~/helpers';

export default {
	components: {
		profile,
	},
	data() {
		return {
			searchUsers: [],
			randomUsers: [],
			searchQuery: '',
			debouncedInput: '',
			time: 0,
			showResults: false,
		};
	},
	watch: {
		$route(to, from) {
			this.searchQuery = '';
		},
		searchQuery: debounce(function () {
			this.showResults = true;
			this.search();
		}, 200),
	},
	methods: {
		search: throttle(async function () {
			let ilike = `%${this.searchQuery}%`;
			const response = await this.$apollo.query({
				query: USER_SEARCH,
				variables: {
					query: this.searchQuery,
					ilike: ilike,
				},
			});
			if (this.searchQuery.length > 0) {
				let foreignId = response.data.user.length > 0 ? response.data.user[0].id : '';
				let contacts = response.data.contacts.filter((x) => x.contact.id != foreignId);
				contacts = contacts.map((x) => x.contact);
				let randomUsers = response.data.randomUsers.filter((x) => x.id != foreignId);

				var users = new Set(contacts.map((d) => d.id));
				this.searchUsers = [...response.data.user, ...contacts, ...randomUsers.filter((d) => !users.has(d.id))];
			} else {
				this.searchUsers = [...response.data.contacts.map((x) => x.contact)];
			}
		}, 200),
		profileUrl(id) {
			if (id == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + id;
		},
		navTo: throttle(async function (path) {
			this.showResults = false;
			if (this.$router.history.current.path != path) {
				this.$router.push(path);
			}
			return;
		}, 200),
		searchSubmit() {
			if (this.searchUsers.length > 0) {
				this.navTo(this.profileUrl(this.searchUsers[0].id));
			}
		},
	},
};
</script>
