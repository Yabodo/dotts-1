<template>
	<div>
		<div v-if="user.id == $nhost.auth.currentUser.id" class="threadMessage">
			<div class="my message" v-if="output">
				<div v-html="output"></div>
			</div>
			<div v-if="firstReply" class="my avatar">
				<vs-avatar size="37">
					<img v-if="user.avatar_path != null" :src="`${$nhost.baseURL}/storage/o/public/avatar/${user.avatar_path}?w=37&q=37`" alt="" />
				</vs-avatar>
			</div>
		</div>
		<div v-else class="threadMessage">
			<div v-if="firstReply" class="their avatar">
				<vs-avatar size="37">
					<img v-if="user.avatar_path != null" :src="`${$nhost.baseURL}/storage/o/public/avatar/${user.avatar_path}?w=37&q=37`" alt="" />
				</vs-avatar>
			</div>
			<div class="their message" v-if="output">
				<div v-html="output"></div>
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
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export default {
	data: function () {
		return {
			data: false,
			editMessageButton: false,
		};
	},
	props: ['user', 'time', 'message', 'firstReply'],
	computed: {
		ago: function () {
			timeAgo.addLocale(en);
			let msTime = Date.parse(this.time);
			const ago = new timeAgo('en-US');
			return ago.format(msTime);
		},
		output() {
			if (Object.keys(this.message).length > 0) {
				let html = generateHTML(this.message, [StarterKit]);
				return html;
			} else return null;
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
