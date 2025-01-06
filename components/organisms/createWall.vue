<template>
	<div>
		<form @submit.prevent="create()" autocomplete="off">
			<vs-input v-model="prompts.wall.name" :placeholder="$t('components.organisms.createWall.wallName')"></vs-input>

			<vs-select block :placeholder="$t('components.organisms.createWall.visibility')" v-model="prompts.wall.visibility" style="padding: 1rem 0 1rem 0">
				<vs-option :label="$t('components.organisms.createWall.public.title')" value="public">
					{{ $t('components.organisms.createWall.public.title') }}
				</vs-option>
				<vs-option :label="$t('components.organisms.createWall.personal.title')" value="personal">
					{{ $t('components.organisms.createWall.personal.title') }}
				</vs-option>
				<vs-option :label="$t('components.organisms.createWall.private.title')" value="private">
					{{ $t('components.organisms.createWall.private.title') }}
				</vs-option>
			</vs-select>
			<div v-if="prompts.wall.visibility == 'public'">
				<p>
					{{ $t('components.organisms.createWall.public.description') }}
				</p>
			</div>
			<div v-else-if="prompts.wall.visibility == 'private'">
				<p>
					{{ $t('components.organisms.createWall.private.description') }}
				</p>
			</div>
			<div v-else-if="prompts.wall.visibility == 'personal'">
				<p>
					{{ $t('components.organisms.createWall.personal.description') }}
				</p>
				<contact-picker @update="wallPasses = $event.ids" />
			</div>
		</form>
	</div>
</template>

<script>
import gql from 'graphql-tag';
import { throttle } from '~/helpers';
import contactPicker from '~/components/mutators/contactPicker.vue';
import { INSERT_ONE_WALL, INSERT_WALL_PASSES, INSERT_ONE_ROOM_WALL, INSERT_ROOM_WALLS } from '~/store/queries/wall.js';

export default {
	components: {
		contactPicker,
	},
	props: {
		propPrivacy: {
			type: String,
			default: 'public',
			required: false,
		},
	},
	data: function () {
		return {
			prompts: {
				wall: {
					show: false,
					update: false,
					name: '',
					visibility: this.propPrivacy, //public,personal,private
				},
			},
			loading: false,
			wallPasses: [],
		};
	},
	methods: {
		getRoom() {
			if (this.$nuxt.context.params.hasOwnProperty('room')) {
				return this.$nuxt.context.params.room;
			} else return null;
		},
		create: throttle(async function () {
			var visibilityTypes = ['public', 'personal', 'private'];
			let name = this.prompts.wall.name;
			let visibility = this.prompts.wall.visibility;

			//If conditions
			let correctName = this.prompts.wall.name + '';
			let correctVisibility = visibilityTypes.includes(this.prompts.wall.visibility);
			let correctLength = name.length < 50 && name.length > 0;

			if (correctName && correctVisibility && correctLength) {
				const response = await this.$apollo.mutate({
					mutation: INSERT_ONE_WALL,
					variables: {
						name: name,
						visibility: visibility,
					},
				});
				// do what you want with data
				this.prompts.wall.name = '';
				this.prompts.wall.visibility = 'public';
				this.prompts.wall.show = false;
				this.createWallPasses(response.data.insert_walls_one.id);
				this.createRoomWalls(response.data.insert_walls_one.id);
				this.$emit('newWalls', true);
			} else {
				this.openNotification(
					this.$t('components.organisms.createWall.notifications.nameWrongFormat.title'),
					this.$t('components.organisms.createWall.notifications.nameWrongFormat.description'),
				);
			}
		}, 500),
		createWallPasses: throttle(async function (wallId) {
			if (this.wallPasses.length > 0) {
				let gqlAdded = [];
				this.wallPasses.map((x) => {
					gqlAdded.push({
						user_id: x,
						wall_id: wallId,
					});
				});
				const response = await this.$apollo.mutate({
					mutation: INSERT_WALL_PASSES,
					variables: {
						added: gqlAdded,
					},
				});
			}
		}, 500),
		createRoomWalls: throttle(async function (wallId) {
			let roomId = this.getRoom();
			if (typeof roomId === 'string') {
				let gqlAdded = [{ wall_id: wallId }, { wall_id: wallId, room_id: roomId }];
				const response = await this.$apollo.mutate({
					mutation: INSERT_ROOM_WALLS,
					variables: {
						added: gqlAdded,
					},
				});
			} else {
				const response = await this.$apollo.mutate({
					mutation: INSERT_ONE_ROOM_WALL,
					variables: {
						wall_id: wallId,
					},
				});
			}
		}, 500),
		openNotification(title, text, color = 'primary', duration = 6000) {
			this.$vs.notification({
				duration: duration,
				position: 'top-center',
				color: color,
				title: title,
				text: text,
			});
		},
	},
};
</script>
