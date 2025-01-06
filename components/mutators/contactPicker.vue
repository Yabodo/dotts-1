<template>
	<div class="component userSearch">
		<form style="margin-top: 0.5rem" @submit.prevent="selectFirstUser()" autocomplete="off">
			<vs-input @click.stop="search()" primary v-model="searchQuery" :placeholder="this.$t('components.organisms.userSearch.placeholder')" class="searchBox" />
		</form>
		<div v-if="searchUsers.length > 0" class="results">
			<button @mouseup="searchUsers = []" class="vs-dialog__close">
				<i class="vs-icon-close vs-icon-hover-x"></i>
			</button>
			<div v-for="user in searchUsers" :key="user.id" @click.stop="selectUser(user.id)" style="cursor: pointer" class="result">
				<div style="pointer-events: none">
					<profile :propId="user.id" :address="user.address" :avatar_path="user.avatar_path" :display_name="user.display_name" :shortline="user.shortline" />
				</div>
			</div>
		</div>
		<span style="padding: 0.2rem 0; margin: 0.2rem 0" v-for="user in selected.users" :key="user.id" class="vs-select__chips__chip">
			<p>{{ user.display_name }}</p>
			<div @click.stop="removeUser(user.id)" class="overlay"></div>
			<span @click.stop="removeUser(user.id)" class="vs-select__chips__chip__close">
				<i class="vs-icon-close vs-icon-hover-less"></i>
			</span>
		</span>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import profile from '~/components/molecules/profile.vue';
import { debounce, throttle } from '~/helpers';

export default {
	props: {
		preSelected: {
			type: Array,
			required: false,
		},
		list: {
			type: Array,
			required: false,
		},
	},
	components: {
		profile,
	},
	data() {
		return {
			searchUsers: [],
			searchQuery: '',
			debouncedInput: '',
			time: 0,
			selected: {
				ids: this.preSelected || [],
				users: this.list || [],
			},
		};
	},
	watch: {
		searchQuery: debounce(function () {
			this.search();
		}, 15),
		'selected.ids': debounce(function () {
			this.search();
		}, 15),
	},
	methods: {
		search: throttle(async function () {
			let ilike = `%${this.searchQuery}%`;
			let nin = this.selected.ids;
			const response = await this.$apollo.query({
				query: gql`
					query MyQuery($ilike: String!, $nin: [uuid!]!) {
						contacts(limit: 5, where: { _and: [{ contact: { display_name: { _ilike: $ilike } } }, { contact_id: { _nin: $nin } }] }) {
							contact {
								id
								display_name
								avatar_path
								shortline
								address
							}
						}
					}
				`,
				variables: {
					ilike,
					nin,
				},
			});
			this.searchUsers = response.data.contacts.map((x) => x.contact);
		}, 15),
		profileUrl(id) {
			if (id == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + id;
		},
		selectFirstUser() {
			if (this.searchUsers.length > 0) {
				this.selectUser(this.searchUsers[0].id);
				this.searchUsers.shift();
			}
		},
		selectUser(id) {
			if (!this.selected.ids.includes(id)) {
				this.selected.ids.push(id);
				this.selected.users.push(this.searchUsers.find((x) => x.id == id));
			}
			this.searchQuery = '';
			this.$emit('update', this.selected);
		},
		removeUser(id) {
			let idIndex = this.selected.ids.findIndex((x) => x == id);
			let userIndex = this.selected.users.findIndex((x) => x.id == id);
			if (idIndex + userIndex != -2) {
				this.selected.ids.splice(idIndex, 1);
				this.selected.users.splice(userIndex, 1);
			}
			this.$emit('update', this.selected);
		},
	},
};
</script>
