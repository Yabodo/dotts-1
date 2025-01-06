<template>
	<div class="component profile">
		<NuxtLink :to="profileUrl()" class="con-avatars">
			<vs-avatar v-if="avatar_path != null">
				<img :src="`${$nhost.baseURL}/storage/o/public/avatar/${avatar_path}?w=44&q=44`" alt="" />
			</vs-avatar>
			<vs-avatar :color="avatarColor" v-else>
				<template #text style="color: #fff"> {{ display_name.toUpperCase() }} </template>
			</vs-avatar>
		</NuxtLink>
		<div class="info">
			<NuxtLink :to="profileUrl()" class="names">
				<h4 v-if="display_name">
					{{ display_name }}
				</h4>
				<p v-if="displayAddress">({{ address }})</p>
			</NuxtLink>
			<NuxtLink :to="profileUrl()" v-if="shortline"
				><p>{{ shortline }}</p></NuxtLink
			>
		</div>
	</div>
</template>

<script>
import { String2HexCodeColor } from 'string-to-hex-code-color';
import timeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
/*
For the default CSS to work, wrap this molecule in <div class="post">..</div>

Props: ["avatar_path", "display_name", "address", "shortline"] - address required
*/

export default {
	data: function () {
		return {
			data: false,
		};
	},
	props: {
		propId: String,
		avatar_path: String,
		display_name: String,
		address: String,
		shortline: String,
		displayAddress: {
			type: Boolean,
			default: false,
			required: false,
		},
		propTime: {
			type: String,
			default: null,
			required: false,
		},
	},
	methods: {
		profileUrl() {
			if (this.propId == this.$nhost.auth.currentUser.id) return '/profile';
			else return '/profile/' + this.propId;
		},
	},
	computed: {
		avatarColor() {
			const string2HexCodeColor = new String2HexCodeColor();
			return string2HexCodeColor.stringToColor(this.address, -0.2);
		},
		ago: function () {
			if (this.propTime) {
				timeAgo.addLocale(en);
				let msTime = Date.parse(this.propTime);
				const ago = new timeAgo('en-US');
				return ago.format(msTime);
			}
		},
	},
};
</script>
