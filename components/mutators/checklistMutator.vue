<template>
	<div>
		<div class="checklist" v-for="(item, index) in list" :key="index">
			<div class="checkbox">
				<vs-checkbox v-model="selectedItems" :label="item.name" :val="item.id">
					<template v-if="item.visibility == 'public'" #icon>
						<i class="bx bx-broadcast bx-xs"></i>
					</template>
					<template v-else-if="item.visibility == 'personal'" #icon>
						<i class="bx bx-group bx-xs"></i>
					</template>
					<template v-else-if="item.visibility == 'private'" #icon>
						<i class="bx bx-lock-alt bx-xs"></i>
					</template>
					<p class="itemLabel">
						{{ item.name }}
					</p>
				</vs-checkbox>
			</div>
			<div class="linkLabel" v-if="link.path && link.name">
				<a @click="navTo(`${link.path}${item.id}`)" class="linkText">{{ link.name }}</a>
			</div>
			<div class="linkLabel" v-else-if="link.path && labelPath">
				<a @click="navTo(`${link.path}${item.id}`)" class="linkText">{{ fetchFromObject(item, labelPath) }}</a>
			</div>
		</div>
	</div>
</template>
<script>
/*
Props: [
    'list': Array*[..., {..., 'id', 'name'}], 
    'linkPath': String, 
    'linkName': String,
    'selected': Array,
	'labelPath': String //directions to navigate in a single 'list' array's item
]

Emits: [
  Array: 'change', 
  String`url: 'navTo'
]
*/

export default {
	data() {
		return {
			selectedItems: [],
			link: {
				path: this.linkPath,
				name: this.linkName,
			},
		};
	},
	props: ['list', 'linkPath', 'linkName', 'selected', 'labelPath'],
	watch: {
		selected() {
			this.$emit('change', this.selectedItems);
		},
	},
	beforeMount() {
		if (this.selected) {
			this.selectedItems = this.selected;
		}
	},
	methods: {
		navTo(id) {
			this.$emit('navTo', id);
		},
		fetchFromObject(obj, prop) {
			if (typeof obj === 'undefined') {
				return false;
			}
			var _index = prop.indexOf('.');
			if (_index > -1) {
				return this.fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
			}
			return obj[prop];
		},
	},
};
</script>
