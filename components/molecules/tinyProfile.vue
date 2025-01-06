<template>
	<div class="component tinyProfile">
		<div class="con-avatars">
			<vs-avatar size="22">
				<img v-if="user.avatar_path != null" :src="`${$nhost.baseURL}/storage/o/public/avatar/${user.avatar_path}?w=22&q=22`" alt="" />
			</vs-avatar>
		</div>
		<div class="info">
			<div :to="profileUrl()" class="names">
				<h4 v-if="user.display_name">
					{{ user.display_name }}
				</h4>
				<p>({{ ago }})</p>
			</div>
		</div>
	</div>
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
