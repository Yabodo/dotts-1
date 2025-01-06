<template>
	<div>
		<div v-if="walls.list.length > 0">
			<p style="margin: 0.25rem 0">{{ $t('components.organisms.userWallPermissions.userCanAccess') }}</p>
			<div>
				<checklistMutator
					:list="walls.list"
					linkPath="/read/wall/"
					:linkName="$t('components.organisms.userWallPermissions.openWall')"
					@change="walls.after = $event"
					@navTo="$router.push($event)"
					:selected="walls.after"
				/>
			</div>
			<div style="display: flex">
				<div style="width: 100%; margin: 0.5rem">
					<vs-button @click="updateWallPermissions()" block>
						{{ $t('components.organisms.userWallPermissions.savePermissions') }}
					</vs-button>
				</div>
			</div>
		</div>
		<div v-else>
			<h3>{{ $t('components.organisms.userWallPermissions.createFirstWall.title') }}</h3>
			<p class="lowerlight">{{ $t('components.organisms.userWallPermissions.createFirstWall.description') }}</p>
			<div style="margin: 0.5rem 0">
				<vs-button @click="$emit('createWall', true)" block>{{ $t('components.organisms.userWallPermissions.createFirstWall.createWall') }}</vs-button>
				<vs-button @click="$router.push('/read')" flat block>{{ $t('components.organisms.userWallPermissions.createFirstWall.dontCreateWall') }}</vs-button>
			</div>
		</div>
	</div>
</template>

<script>
/*
Props: [
    String*: 'id'
]
Emits: [
    Boolean: 'submitted'
]
*/

import gql from 'graphql-tag';
import profile from '~/components/molecules/profile.vue';
import checklistMutator from '~/components/mutators/checklistMutator';
import { throttle } from '~/helpers';
export default {
	components: {
		profile,
		checklistMutator,
	},
	data() {
		return {
			user: this.propId,
			showDialog: true,
			walls: {
				before: [],
				after: [],
				list: [],
			},
			previousWallCount: -1,
		};
	},
	props: ['propId'],
	methods: {
		updateWallPermissions: throttle(async function () {
			this.$emit('submit', true);
			let createdObjects = '';
			let removedObjects = '';
			let removed = this.walls.before.filter((x) => !this.walls.after.includes(x));
			let added = this.walls.after.filter((x) => !this.walls.before.includes(x));
			//GQL remove where wall_id _eq removed && room_id _eq _slug
			//GQL add wall_id _eq added && room_id _eq _slug
			if (added.length > 0 || removed.length > 0) {
				if (removed.length > 0) {
					removed.forEach((wall, index) => {
						removedObjects = removedObjects.concat(`del${index}: delete_wall_passes(where: {user_id: {_eq: "${this.user}"}, 
                            _and: [
                                {wall_id: {_eq: "${wall}"}}
                            ]}
                        ) {affected_rows}`);
					});
				}
				if (added.length > 0) {
					console.log(this.user);
					added.forEach((wall, index) => {
						createdObjects = createdObjects.concat(`{wall_id: "${wall}", user_id: "${this.user}"},`);
					});
					createdObjects = `insert_wall_passes(objects: [${createdObjects}]) {					
                                    returning {
                                        id
                                    }
                                }`;
				}
				const response = await this.$apollo.mutate({
					mutation: gql`
						mutation MyMutation {
							${removedObjects}
							${createdObjects}
						}
					`,
				});
				this.walls.before = this.walls.after.slice();
				return true;
			}
			return false;
		}, 1000),
	},
	apollo: {
		$subscribe: {
			wall_passes: {
				query: gql`
					subscription postInfo($user: uuid!) {
						wall_passes(where: { user_id: { _eq: $user } }) {
							id: wall_id
						}
					}
				`,
				variables() {
					return {
						user: this.user,
					};
				},
				result({ data }) {
					if (data.wall_passes.length > 0) {
						data.wall_passes.map((wall) => {
							this.walls.before.push(wall.id);
							this.walls.after.push(wall.id);
						});
					}
				},
			},
			walls: {
				query: gql`
					subscription postInfo($me: uuid!, $visibility: String!) {
						walls(where: { _and: [{ visibility: { _eq: $visibility } }, { owner: { _eq: $me } }] }, order_by: { name: asc_nulls_last }) {
							id
							name
							visibility
						}
					}
				`,
				variables() {
					return {
						me: this.$nhost.auth.currentUser.id,
						visibility: 'personal', //DO NOT TRANSLATE
					};
				},
				result({ data }) {
					this.walls.list = data.walls;
					let wallListLen = data.walls.length;
					if (wallListLen == 1 && this.previousWallCount == 0) {
						this.walls.after.push(data.walls[0].id);
					}
					this.previousWallCount = this.walls.list.length;
				},
			},
		},
	},
};
</script>
