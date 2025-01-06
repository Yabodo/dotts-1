<template #header>
	<h4 class="not-margin">{{ $t('components.organisms.createComment.discussionWith') }} {{ user.display_name }}.</h4>
</template>
<script>
/*
For the default CSS to work, wrap this molecule in <div class="post">..</div>

Props: ['user', 'time'] - both required
*/
import timeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

export default {
	data: function () {
		return {
			data: false,
		};
	},
	props: ['user', 'time'],
	computed: {
		ago: function () {
			timeAgo.addLocale(en);
			let msTime = Date.parse(this.time);
			const ago = new timeAgo('en-US');
			return ago.format(msTime);
		},
	},
	methods: {
		profileUrl() {
			if (this.propId == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + this.propId;
		},
	},
};
</script>
