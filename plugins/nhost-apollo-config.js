export default (ctx) => {
	return {
		httpEndpoint: ctx.$config.hasuraGraphQL,
		wsEndpoint: ctx.$config.hasuraGraphQLWss,
		getAuth: () => {
			const token = ctx.$nhost.auth.getJWTToken();
			return token ? `Bearer ${token}` : null;
		},
	};
};
