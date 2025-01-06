<template>
	<div>
		<div v-if="walls.list.length > 0">
			<h3 class="not-margin">
				{{ $t('components.organisms.aboutPost.title') }}
			</h3>
			<div>
				<p>{{ $t('components.organisms.aboutPost.postWallsTitle') }}</p>
				<checklistMutator
					:list="walls.list"
					linkPath="/read/wall/"
					:linkName="$t('components.organisms.aboutPost.openWall')"
					@navTo="navTo($event)"
					@change="walls.after = $event"
					:selected="walls.after"
				/>
			</div>
			<div style="display: flex">
				<div style="width: 100%; margin: 0.5rem">
					<vs-button @click="updateFollowedWalls()" block>
						{{ $t('components.organisms.aboutPost.update') }}
					</vs-button>
				</div>
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
import checklistMutator from '~/components/mutators/checklistMutator';
import { throttle, getArrayChanges } from '~/helpers';

const feedQuery = {
	room: `
		subscription postInfo($id: uuid!, $room: uuid!) {
			content: contents_by_pk(id: $id) {
				id
				roomWalls: posts(where: {wall: {room_walls: {room_id: {_eq: $room}}}}) {
					wall_id
				}
				allWalls: posts {
					wall {
						id
						name
					}
				}
				user {
					id
					display_name
					avatar_path
					shortline
					address
				}
			}
		}
	`,
	main: `
		subscription postInfo($id: uuid!) {
			content: contents_by_pk(id: $id) {
				id
				posts {
					wall {
						id
						name
						rooms: room_walls {
							id: room_id
						}
					}
				}
				user {
					id
					display_name
					avatar_path
					shortline
					address
				}
			}
		}
	`,
};

export default {
	components: {
		checklistMutator,
	},
	data() {
		return {
			id: this.propId,
			walls: {
				before: [],
				after: [],
				list: [],
			},
			loading: false,
		};
	},
	props: ['propId', 'roomId'],
	methods: {
		navTo(event) {
			this.$emit('navTo', event);
		},
		updateFollowedWalls: throttle(async function () {
			this.loading = true;
			let gqlVariables = {
				added: [],
			};
			let removedObjects = {};
			let removedGql = '';
			let removedGqlVariables = '';
			let wallChanges = getArrayChanges(this.walls.before, this.walls.after);

			if (wallChanges.exist) {
				if (wallChanges.added.length > 0) {
					wallChanges.added.forEach((wall) => {
						if (this.roomId) {
							gqlVariables.added.push({
								wall_id: wall,
								room_id: this.roomId,
							});
						} else {
							gqlVariables.added.push({
								wall_id: wall,
							});
						}
					});
				}
				if (wallChanges.removed.length > 0) {
					if (typeof this.roomId == 'string') {
						removedObjects = wallChanges.removed.reduce((a, v, index) => {
							removedGql = removedGql.concat(`del${index}: delete_room_walls(where: { 
                                _and: [
									{wall_id: {_eq: $wall${index}}}, 
									{user_id: {_eq: $user}},
									{room_id: {_eq: $room}}
                                ]
							}) {affected_rows}`);
							removedGqlVariables = removedGqlVariables.concat(`$wall${index}: uuid!, `);
							return { ...a, [`wall${index}`]: v };
						}, {});
						gqlVariables = { ...gqlVariables, ...removedObjects, user: this.$nhost.auth.currentUser.id, room: this.roomId };
					} else {
						removedObjects = wallChanges.removed.reduce((a, v, index) => {
							removedGql = removedGql.concat(`del${index}: delete_room_walls(where: {
                                _and: [
									{wall_id: {_eq: $wall${index}}}, 
									{user_id: {_eq: $user}},
                                ]
							}) {affected_rows}`);
							removedGqlVariables = removedGqlVariables.concat(`$wall${index}: uuid!, `);
							return { ...a, [`wall${index}`]: v };
						}, {});
						gqlVariables = { ...gqlVariables, ...removedObjects, user: this.$nhost.auth.currentUser.id };
					}
					const response = await this.$apollo.mutate({
						mutation: gql`
							mutation MyMutation($user: uuid!, $room: uuid!, $added: [room_walls_insert_input!]!, ${removedGqlVariables}) {
								${removedGql}
								insert_room_walls(objects: $added) {
									returning {
										id
									}
								}
							}
						`,
						variables: gqlVariables,
					});
				} else {
					const response = await this.$apollo.mutate({
						mutation: gql`
							mutation MyMutation($added: [room_walls_insert_input!]!) {
								insert_room_walls(objects: $added) {
									returning {
										id
										room_id
										wall_id
									}
								}
							}
						`,
						variables: gqlVariables,
					});
				}
				this.$emit('change', { added: wallChanges.added, removed: wallChanges.removed });
				this.loading = false;
				return true;
			}
			this.$emit('change', false);
			this.loading = false;
			return false;
		}, 1000),
	},
	fetch() {
		if (this.roomId != '') {
			this.$apollo.subscriptions.mainFeed.skip = true;
			this.$apollo.subscriptions.roomFeed.skip = false;
		} else {
			this.$apollo.subscriptions.roomFeed.skip = true;
			this.$apollo.subscriptions.mainFeed.skip = false;
		}
	},
	apollo: {
		$subscribe: {
			roomFeed: {
				query: gql(feedQuery.room),
				variables() {
					return {
						id: this.id,
						room: this.roomId,
					};
				},
				result({ data }) {
					let walls = [];
					data.content.roomWalls.map((room) => {
						var id = room.wall_id;
						this.walls.before.push(id);
						this.walls.after.push(id);
					});
					data.content.allWalls.forEach((post) => {
						walls.push({ id: post.wall.id, name: post.wall.name });
					});
					this.walls.list = walls.slice();
				},
				skip: true,
			},
			mainFeed: {
				query: gql(feedQuery.main),
				variables() {
					return {
						id: this.id,
					};
				},
				result({ data }) {
					data.content.posts.map((post) => {
						var id = post.wall.id;
						var name = post.wall.name;
						if (post.wall.rooms.length > 0) {
							this.walls.before.push(id);
							this.walls.after.push(id);
						}
						this.walls.list.push({ id: id, name: name });
					});
				},
				skip: true,
			},
		},
	},
};
</script>
