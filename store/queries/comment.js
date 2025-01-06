import gql from 'graphql-tag';

export const INSERT_COMMENT = gql`
	mutation MyMutation($object: comments_insert_input!) {
		insert_comments_one(object: $object) {
			id
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation MyMutation($pk_columns: comments_pk_columns_input!, $_set: comments_set_input!) {
		update_comments_by_pk(pk_columns: $pk_columns, _set: $_set) {
			id
		}
	}
`;

export const DELETE_COMMENT = gql`
	mutation deleteContent($id: uuid!) {
		delete_comments(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;
