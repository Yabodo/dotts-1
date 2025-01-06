<template>
	<div class="field">
		<div class="vs-input-parent vs-input-parent--state-null vs-input-parent--shadow block vs-component--primary">
			<div class="vs-input-content post-field">
				<client-only>
					<editor-content :editor="editor" style="width: 100%" />
				</client-only>
				<span class="vs-input__icon"><i class="bx bx-message-dots"></i></span>
				<div class="vs-input__affects">
					<div class="vs-input__affects__1"></div>
					<div class="vs-input__affects__2"></div>
					<div class="vs-input__affects__3"></div>
					<div class="vs-input__affects__4"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export default {
	components: {
		EditorContent,
	},

	props: {
		value: {
			type: Object,
			default: null,
		},
	},

	data() {
		return {
			editor: null,
		};
	},

	watch: {
		value(value) {
			// HTML
			// const isSame = this.editor.getHTML() === value;

			// JSON
			const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value);

			if (isSame) {
				return;
			}

			this.editor.commands.setContent(value, false);
		},
	},

	mounted() {
		this.editor = new Editor({
			content: this.value,
			extensions: [
				StarterKit,
				Placeholder.configure({
					// Use a placeholder:
					emptyEditorClass: 'is-editor-empty',
					placeholder: this.$t('components.organisms.updatePost.message'),
					// Use different placeholders depending on the node type:
					// placeholder: ({ node }) => {
					//   if (node.type.name === 'heading') {
					//     return 'What’s the title?'
					//   }

					//   return 'Can you add some further context?'
					// },
				}),
			],
			onUpdate: () => {
				// HTML
				// this.$emit('input', this.editor.getHTML());

				// JSON
				this.$emit('input', this.editor.getJSON());
				this.$emit('plain', this.editor.getText());
			},
		});
	},

	beforeDestroy() {
		this.editor.destroy();
	},
};
</script>
