import gql from 'graphql-tag';

export const UPSERT_LINK = gql`
	mutation upsert_link($object: links_insert_input!) {
		insert_links(object: $object, on_conflict: { constraint: links_url_key, update_columns: [title, favicon, image, description, json] }) {
			returning {
				title
				url
				image
				description
				favicon
			}
		}
	}
`;

export const UPDATE_LINK = gql`
	mutation MyMutation($pk_columns: links_pk_columns_input!, $_set: links_set_input!) {
		update_links_by_pk(pk_columns: $pk_columns, _set: $_set) {
			id
		}
	}
`;

export const DELETE_LINK = gql`
	mutation deletelink($id: uuid!) {
		delete_links(where: { id: { _eq: $id } }) {
			affected_rows
		}
	}
`;
