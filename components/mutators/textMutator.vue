<template>
	<div>
		<h4 v-if="title" class="header">
			{{ title }}
		</h4>
		<form @submit.prevent="submit()">
			<vs-input block type="text" :placeholder="placeholder" @click-icon="submit" icon-after v-model="field">
				<template #icon>
					<i class="bx bx-check" style="color: green; font-size: 1.5rem"></i>
				</template>
			</vs-input>
		</form>
	</div>
</template>
<script>
export default {
	data() {
		return {
			field: '',
		};
	},
	props: ['placeholder', 'title'],
	methods: {
		submit() {
			this.$emit('submit', this.field);
		},
	},
};
</script>
