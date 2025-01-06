<template>
	<div class="component threadTeaser">
		<tiny-profile :user="user" :time="time" />
		<div class="textPreview" v-if="propJson">
			<div v-html="output"></div>
		</div>
	</div>
</template>

<script>
/*
For the default CSS to work, wrap this molecule in <div class="post">..</div>

Props: ['user', 'time'] - both required
*/
import tinyProfile from '~/components/molecules/tinyProfile.vue';
import timeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export default {
	data: function () {
		return {
			data: false,
		};
	},
	components: {
		tinyProfile,
	},
	props: ['user', 'time', 'propJson'],
	computed: {
		ago: function () {
			timeAgo.addLocale(en);
			let msTime = Date.parse(this.time);
			const ago = new timeAgo('en-US');
			return ago.format(msTime);
		},
		output() {
			if (Object.keys(this.propJson).length > 0) {
				let html = generateHTML(this.propJson, [StarterKit]);
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
