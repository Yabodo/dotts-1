<template>
	<div class="component userSearch">
		<form style="margin-top: 0.5rem" @keyup.esc="closeSelection()" @submit.prevent="selectFirstWall()" autocomplete="off">
			<div
				@click.stop="search()"
				class="vs-input-parent searchBox vs-input-parent--state-null vs-component--primary vs-component--is-color"
				:placeholder="$t('components.molecules.roomWallPicker.searchWalls')"
			>
				<div class="vs-input-content vs-input-content--has-color">
					<input ref="roomWallSearch" v-model="searchQuery" placeholder="" id="vs-input--1824" class="vs-input" />
					<label v-if="searchQuery.length == 0" for="vs-input--1824" class="vs-input__label"> {{ $t('components.molecules.roomWallPicker.searchWalls') }}</label>
					<div class="vs-input__affects">
						<div class="vs-input__affects__1"></div>
						<div class="vs-input__affects__2"></div>
						<div class="vs-input__affects__3"></div>
						<div class="vs-input__affects__4"></div>
					</div>
				</div>
				<!----><!----><!----><!---->
			</div>
		</form>
		<div v-if="searchWalls.length > 0" class="results">
			<button @mouseup="closeSelection()" class="vs-dialog__close">
				<i class="vs-icon-close vs-icon-hover-x"></i>
			</button>
			<div v-for="wall in searchWalls" :key="wall.id" @click="selectWall(wall.id)" style="cursor: pointer" class="result">
				<div style="pointer-events: none">
					<div class="component profile">
						<div class="con-avatars">
							<vs-avatar>
								<img v-if="wall.user.avatar_path != null" :src="`${$nhost.baseURL}/storage/o/public/avatar/${wall.user.avatar_path}?w=44&q=44`" alt="" />
							</vs-avatar>
						</div>
						<div class="info">
							<div class="names">
								<h4>
									{{ wall.name }}
								</h4>
								<p>({{ wall.user.display_name }})</p>
							</div>
							<div>
								<p>{{ wall.description }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<span style="padding: 0.2rem 0; margin: 0.2rem 0" v-for="wall in selected.walls" :key="wall.id" class="vs-select__chips__chip">
			<p>{{ wall.name }}</p>
			<div @click.stop="removeWall(wall.id)" class="overlay"></div>
			<span @click.stop="removeWall(wall.id)" class="vs-select__chips__chip__close">
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
	props: ['list', 'linkPath', 'linkName', 'preSelected', 'labelPath'],
	components: {
		profile,
	},
	data() {
		return {
			searchWalls: [],
			searchQuery: '',
			debouncedInput: '',
			time: 0,
			selected: {
				walls: this.preSelected.walls || [],
				ids: this.preSelected.ids || [],
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
						room_walls(
							limit: 5
							where: { _and: [{ _or: [{ wall: { user: { display_name: { _ilike: $ilike } } } }, { wall: { name: { _ilike: $ilike } } }] }, { wall_id: { _nin: $nin } }] }
							distinct_on: wall_id
						) {
							wall {
								id
								name
								description
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
				variables: {
					ilike,
					nin,
				},
			});
			this.searchWalls = response.data.room_walls.map((x) => x.wall);
		}, 15),
		profileUrl(id) {
			if (id == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + id;
		},
		selectFirstWall() {
			if (this.searchWalls.length > 0) {
				this.selectWall(this.searchWalls[0].id);
				this.searchWalls.shift();
			}
		},
		selectWall(id) {
			if (!this.selected.ids.includes(id)) {
				this.selected.ids.push(id);
				this.selected.walls.push(this.searchWalls.find((x) => x.id == id));
			}
			this.$emit('update', this.selected);
			this.$refs.roomWallSearch.focus();
		},
		removeWall(id) {
			let idIndex = this.selected.ids.findIndex((x) => x == id);
			let wallIndex = this.selected.walls.findIndex((x) => x.id == id);
			if (idIndex + wallIndex != -2) {
				this.selected.ids.splice(idIndex, 1);
				this.selected.walls.splice(wallIndex, 1);
			}
			this.$emit('update', this.selected);
		},
		closeSelection() {
			this.searchWalls = [];
			this.searchQuery = '';
		},
	},
};
</script>
