<template>
	<div style="display: flex; flex-direction: column; align-items: center">
		<div class="avatarContainer">
			<vs-avatar pointer @click="clicked('avatar')" size="70">
				<img v-if="avatar_path != null" :src="`${this.$nhost.baseURL}/storage/o/public/avatar/${avatar_path}?w=70&q=70`" alt="" />
			</vs-avatar>
			<vs-button circle icon danger class="logout" @click="clicked('logout')">
				<i class="bx bx-log-out-circle bx-flip-horizontal"></i>
			</vs-button>
			<vs-button circle icon primary class="settings" @click="clicked('settings')">
				<i class="bx bx-cog bx-flip-horizontal"></i>
			</vs-button>
		</div>
		<div class="pointer" @click="clicked('display_name')">
			<h2 v-if="display_name">{{ display_name }}</h2>
			<h2 v-else>
				{{ $t('components.molecules.profileDetailed.addUsername') }}
			</h2>
		</div>
		<div class="pointer" @click="clicked('shortline')">
			<p style="text-align: center" v-if="shortline">{{ shortline }}</p>
			<p v-else>{{ $t('components.molecules.profileDetailed.addShortline') }}</p>
		</div>
		<div class="socials pointer" @click="clicked('socials')">
			<div v-if="socials.length > 0 && false == true">
				<img :src="socials.link.favicon" alt="" />
			</div>
			<p style="lowlight" v-if="socials.length > 0 && false == true">{{ $t('components.molecules.profileDetailed.addSocials') }}</p>
		</div>
		<p style="text-align: center" class="pointer" @click="clicked('address')">({{ address }})</p>
	</div>
</template>

<script>
/*
For the default CSS to work, wrap this molecule in <div class="post">..</div>

Emits: ["clicked"]
Props: ["propId", "avatar_path", "display_name", "address", "shortline"] - address required
*/

export default {
	data: function () {
		return {
			data: false,
		};
	},
	props: ['propId', 'avatar_path', 'display_name', 'address', 'shortline', 'socials'],
	methods: {
		clicked(element) {
			this.$emit('clicked', element);
		},
	},
};
</script>
