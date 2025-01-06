// Everything in store should be done within the 4 commands. Get data, use data, modify data, store data.

// Enable store for auth module
export const state = () => ({
	// THIS IS DATA. Single source of truth in app. Contains the data in its pure form
	user: {
		token: '',
	},
	dialogs: {
		login: false,
		register: false,
		cookies: false,
		settings: false,
	},
	counter: 0,
	totalTvCount: 10, // The TV inventory
	members: [
		{
			name: 'Kathie Brooks',
			email: 'k.brooks@gmail.com',
			role: 'Full-Stack Developer',
			id: '0',
		},
		{
			name: 'Zoey Summer',
			email: 'zoey.summer@gmail.com',
			role: 'Front-End Developer',
			id: '1',
		},
		{
			name: 'Mariah Johnson',
			email: 'j.mariah@gmail.com',
			role: 'UI/UX Designer',
			id: '2',
		},
		{
			name: 'David Ducker',
			email: 'd.ducker@gmail.com',
			role: 'HR Manager',
			id: '3',
		},
	],
	listings: [],
	creditCards: [],
});

export const mutations = {
	// THIS IS FOR UPDATING THE DATA (STATE). No other ways should be used. 'state' parameter is provided by Nuxt automatically. It is syncronous.
	storeCreatePost(state, post) {
		state.posts = state.posts.unshift(post);
	},
};

export const getters = {
	// THIS IS FOR USING THE DATA (STATE) IN A DESIRED WAY. Contains functions you want to execute with the data (state).
};

export const actions = {
	// THIS IS FOR EXECUTING ASYNCRONOUS (APIs etc) ACTIONS. Actions can and usually will end with mutations for saving (storing) the data (state).
};
