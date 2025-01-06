<template>
	<div class="component commentBox">
		<div class="field">
			<div class="vs-input-parent vs-input-parent--state-null vs-input-parent--shadow block vs-component--primary" style="z-index: 1">
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
			<div class="sendButton">
				<vs-button @click="submitComment()" icon flat border>
					<i class="bx bxs-paper-plane"></i>
				</vs-button>
			</div>
		</div>
	</div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { INSERT_CONTENT } from '~/store/queries/content.js';
import { INSERT_COMMENT } from '~/store/queries/comment.js';

export default {
	components: {
		EditorContent,
	},

	props: {
		value: {
			type: Object,
			default: null,
		},
		threadId: {
			type: String,
			default: null,
		},
		parentId: {
			type: String,
			default: null,
		},
	},

	data() {
		return {
			editor: null,
		};
	},

	methods: {
		async submitComment() {
			// Create Link - NB! Link creation is not yet fully implemented
			if (!this.editor.isEmpty) {
				let url = '';
				//let url = this.new_post.url.trim();
				if (!url.startsWith('http://') && !url.startsWith('https://') && url != '') {
					url = 'http://'.concat(url);
				}
				if (this.$validator.isURL(url)) await this.createLink(url);
				// Create Content
				let content = await this.createContent(url, this.editor.getJSON());
				// Create Comment
				if (content && content.hasOwnProperty('id')) {
					let comment = await this.createComment(this.parentId, this.threadId, content.id);
					this.$emit('created', { comment: comment, json: this.editor.getJSON, url: url });
				}
			}
		},
		async createContent(url, json) {
			let contentObject = {};
			if (this.$validator.isURL(url)) contentObject.link = encodeURIComponent(url);
			if (json != null) contentObject.json = json;
			if (contentObject.hasOwnProperty('json') || contentObject.hasOwnProperty('link')) {
				const query = INSERT_CONTENT;
				const response = await this.$apollo.mutate({
					mutation: query,
					variables: {
						object: contentObject,
					},
				});
				// do what you want with data
				return response.data.insert_contents_one;
			}
			return false;
		},
		async createLink(url) {
			if (this.$validator.isURL(url)) {
				const result = await this.$setLink(url);
				return true;
			} else {
				return false;
			}
		},
		async createComment(parentId, threadId, contentId) {
			let commentObject = {
				parent_id: parentId,
				thread_id: threadId,
				content_id: contentId,
			};
			const query = INSERT_COMMENT;
			const response = await this.$apollo.mutate({
				mutation: query,
				variables: {
					object: commentObject,
				},
			});
			// do what you want with data
			return response.data.insert_comments_one;
		},
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
					placeholder: this.$t('components.organisms.createComment.message'),
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
			},
		});
	},

	beforeDestroy() {
		this.editor.destroy();
	},
};
</script>
