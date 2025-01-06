import gql from 'graphql-tag';

export const INSERT_CONTENT = gql`
	mutation MyMutation($object: contents_insert_input!) {
		insert_contents_one(object: $object) {
			id
		}
	}
`;

export const UPDATE_CONTENT = gql`
	mutation MyMutation($pk_columns: contents_pk_columns_input!, $_set: contents_set_input!) {
		update_contents_by_pk(pk_columns: $pk_columns, _set: $_set) {
			id
		}
	}
`;

export const DELETE_CONTENT = gql`
	mutation deleteContent($id: uuid!) {
		delete_contents(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;
