import gql from 'graphql-tag';

export const INSERT_POSTS = gql`
	mutation MyMutation($added: [posts_insert_input!]!) {
		insert_posts(objects: $added) {
			returning {
				id
			}
		}
	}
`;

export function REMOVE_AND_ADD_POSTS(removedGqlVariables, removedGql) {
	return gql`
        mutation MyMutation($content: uuid!, $added: [posts_insert_input!]!, ${removedGqlVariables}) {
            ${removedGql}
            insert_posts(objects: $added) {
                returning {
                    id
                }
            }
        }
    `;
}

export const DELETE_POSTS = gql`
	mutation deletePost($id: uuid!) {
		delete_posts(where: { content_id: { _eq: $id } }) {
			affected_rows
		}
	}
`;

export const POST_WALLS = gql`
	query postWalls($post: uuid!) {
		walls: posts(where: { content_id: { _eq: $post } }) {
			wall_id
		}
	}
`;
