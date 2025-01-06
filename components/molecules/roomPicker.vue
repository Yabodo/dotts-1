<template>
    <div>
        <h4 v-if="title" class="header">
            Pick rooms for this wall
        </h4>
    </div>
</template>

<script>
    import gql from 'graphql-tag';  
export default {
    
	apollo: {
		posts: {
			query: gql`
				query MyQuery {
					posts {
						id
					}
				}
			`,
			result({ data }) {
				this.posts = data.posts;
			},
		},
		$subscribe: {
			user: {
				query: gql`
					query MyQuery($user: uuid!) {
						users(where: {id: {_eq: $user}}) {
							id
							display_name
							avatar_path
							shortline
							created_at
							rooms {
								id
								name
							}

							room_walls(distinct_on: wall_id) {
								wall {
									id
									name
									room_walls {
										room {
											id
										}
									}
								}
							}
						}
						walls(where: {room_walls: {user_id: {_eq: $user}}}) {
							id
							name
							user {
								id
								display_name
								address
							}
						}
					}
				`,
				variables () {
					return {
						user: this.$nhost.auth.currentUser.id,
					}
				},
				result ({data}) {
					this.user = data.users[0]
					this.walls = data.walls
				}
			}
		}
	},
}
</script>