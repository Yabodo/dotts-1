import gql from 'graphql-tag';

export const INSERT_ONE_WALL = gql`
	mutation MyMutation($name: String!, $visibility: String!) {
		insert_walls_one(object: { name: $name, visibility: $visibility }) {
			id
			name
			visibility
		}
	}
`;

export const INSERT_ONE_ROOM_WALL = gql`
	mutation MyMutation($wall_id: uuid!) {
		insert_room_walls_one(object: { wall_id: $wall_id }) {
			id
		}
	}
`;

export const INSERT_WALL_PASSES = gql`
	mutation MyMutation($added: [wall_passes_insert_input!]!) {
		insert_wall_passes(objects: $added) {
			returning {
				id
			}
		}
	}
`;

export const INSERT_ROOM_WALLS = gql`
	mutation MyMutation($added: [room_walls_insert_input!]!) {
		insert_room_walls(objects: $added) {
			returning {
				id
			}
		}
	}
`;
