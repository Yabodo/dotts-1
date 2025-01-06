import gql from 'graphql-tag';

export const USER_SEARCH = gql`
	query MyQuery($query: String!, $ilike: String!) {
		user: search_users(args: { search: $query }) {
			id
			display_name
			avatar_path
			shortline
			address
		}
		contacts(limit: 4, where: { contact: { display_name: { _ilike: $ilike } } }) {
			contact {
				id
				display_name
				avatar_path
				shortline
				address
			}
		}
		randomUsers: users(limit: 5, where: { display_name: { _ilike: $ilike } }) {
			id
			display_name
			avatar_path
			shortline
			address
		}
	}
`;

export const READ_USER_WALLS = gql`
	subscription MyQuery($user: uuid!) {
		walls(order_by: { name: asc_nulls_last }, where: { owner: { _eq: $user } }) {
			id
			name
			visibility
		}
	}
`;

export const READ_OWNED_INROOM_ROOM_WALLS = gql`
	query MyQuery($room_id: uuid!, $user_id: uuid!) {
		inRoom: room_walls(order_by: { wall: { name: asc_nulls_last } }, where: { _and: [{ room_id: { _eq: $room_id } }, { wall: { owner: { _eq: $user_id } } }] }) {
			wall {
				name
				id
				visibility
			}
		}
		exRoom: room_walls(order_by: { wall: { name: asc_nulls_last } }, where: { _and: [{ _or: [{ room_id: { _is_null: true } }] }, { wall: { owner: { _eq: $user_id } } }] }) {
			wall {
				name
				id
				visibility
			}
		}
	}
`;
