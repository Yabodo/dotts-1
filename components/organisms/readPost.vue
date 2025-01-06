<template>
	<div class="post">
		<div class="row" style="height: 100%">
			<profile
				:propId="propPost.user.id"
				:avatar_path="propPost.user.avatar_path"
				:display_name="propPost.user.display_name"
				:address="propPost.user.address"
				:shortline="propPost.user.shortline"
				:propTime="propPost.time"
			/>
		</div>
		<div style="display: flex" class="message" v-if="propPost.message">
			<p v-if="!propPost.link && propPost.user.id == $nhost.auth.currentUser.id" class="edit" @click="edit()">{{ $stringify(propPost.message) }}</p>
			<p v-else-if="!propPost.link" class="edit" @click="about()">{{ $stringify(propPost.message) }}</p>
			<p v-else>{{ $stringify(propPost.message) }}</p>
		</div>
		<div style="display: flex" class="message" v-if="output">
			<div v-html="output"></div>
		</div>
		<div style="margin-top: 1rem" v-if="propPost.link">
			<div v-if="linkType == 'youtube'">
				<lite-youtube :videoid="linkParams.id" playlabel="Play Video" :params="linkParams.string" :key="linkParams.id" />
			</div>
			<div v-else-if="linkType == 'soundcloud'">
				<iframe class="iframeMedia" scrolling="no" frameborder="no" allow="autoplay" :src="linkParams.url"> </iframe>
			</div>
			<div v-else-if="linkType == 'spotify'">
				<iframe width="100%" :src="linkParams.url" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
			</div>
			<div v-else-if="linkType == 'reddit'">
				<iframe height="126" id="reddit-embed" :src="linkParams.url" sandbox="allow-scripts allow-same-origin allow-popups" style="border: none" scrolling="no"> </iframe>
			</div>
			<!-- <div v-else-if="linkType == 'imgur'" :key="propPost.link.url">
				<blockquote class="imgur-embed-pub" lang="en" data-id="a/coPDvkF">
					<a v-if="propPost.link.title" :href="linkParams.url">{{ propPost.link.title }}</a>
				</blockquote>
				<script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
			</div> -->
			<div v-else-if="linkType == 'ted'">
				<div>
					<iframe :src="linkParams.url" frameborder="0" scrolling="no" allowfullscreen> </iframe>
				</div>
			</div>
			<div v-else-if="iframe && linkType != 'imgur'">
				<div class="microData" :key="propPost.link.url" v-html="iframe"></div>
			</div>
			<div v-else class="url">
				<div class="link">
					<div class="bar titleBar">
						<img style="height: 16px" v-if="propPost.link.favicon" :src="$stringify(propPost.link.favicon, true)" alt="" />
						<p v-if="propPost.link.title">{{ $stringify(propPost.link.title, true) }}</p>
						<p v-else>{{ $stringify(propPost.link.url, true) }}</p>
					</div>
					<div class="bar descBar">
						<p v-if="propPost.link.description">{{ $stringify(propPost.link.description, true) }}</p>
					</div>
				</div>
				<div class="linkMenu" @mouseleave="animated = false">
					<a @click="edit()" v-if="propPost.user.id == $nhost.auth.currentUser.id" class="button anim-icon">
						<i class="bx bxs-edit bx-tada"></i>
						<i class="bx bx-edit"></i>
					</a>
					<a @click="about()" v-else class="button anim-icon">
						<i class="bx bxs-folder-open bx-tada"></i>
						<i class="bx bx-folder-open"></i>
					</a>
					<a v-if="propPost.user.id != $nhost.auth.currentUser.id" @click="post()" class="button anim-icon">
						<i class="bx bxs-share-alt bx-tada"></i>
						<i class="bx bx-share-alt"></i>
					</a>
					<a @click="open($stringify(propPost.link.url, true))" class="button anim-icon">
						<i class="bx bx-link-external bx-tada"></i>
						<i class="bx bx-link-external"></i>
					</a>
				</div>
				<div class="linkBubble">
					<i class="bx bx-link"></i>
					<p>{{ $stringify(propPost.link.url, true) }}</p>
				</div>
			</div>
		</div>
		<div v-if="!propPost.link || linkType != 'default' || iframe" class="menu">
			<a @click="edit()" v-if="propPost.user.id == $nhost.auth.currentUser.id" class="button anim-icon">
				<i class="bx bxs-edit bx-tada"></i>
				<i class="bx bx-edit"></i>
			</a>
			<a @click="about()" v-else class="button anim-icon">
				<i class="bx bxs-folder-open bx-tada"></i>
				<i class="bx bx-folder-open"></i>
			</a>
			<a v-if="propPost.user.id != $nhost.auth.currentUser.id" @click="post()" class="button anim-icon">
				<i class="bx bxs-share-alt bx-tada"></i>
				<i class="bx bx-share-alt"></i>
			</a>
			<a v-if="propPost.link" @click="open($stringify(propPost.link.url, true))" class="button anim-icon">
				<i class="bx bx-link-external bx-tada"></i>
				<i class="bx bx-link-external"></i>
			</a>
		</div>
		<commentSection :propPost="propPost" />
	</div>
</template>
<script>
import gql from 'graphql-tag';
import profile from '~/components/molecules/profile.vue';
import youtube from '~/components/molecules/links/youtube.vue';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import commentSection from '~/components/complexOrganisms/commentSection.vue';

export default {
	components: {
		profile,
		youtube,
		commentSection,
	},
	data() {
		return {
			animated: false,
			feedLimit: 10,
			mouseOver: false,
			showComments: false,
			field: '',
			linkTypes: ['default', 'youtube'],
			linkArrays: {
				youtube: ['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com'],
				soundcloud: ['soundcloud.com'],
				spotify: ['open.spotify.com'],
				reddit: ['reddit.com', 'www.reddit.com'],
				imgur: ['imgur.com'],
				ted: ['ted.com', 'www.ted.com'],
			},
			linkParams: {},
			newComment: {
				message: null,
			},
			threads: [],
		};
	},
	props: ['propPost'],
	methods: {
		about() {
			this.$emit('aboutPost', {
				id: this.propPost.id,
			});
		},
		post() {
			this.$emit('savePost', this.propPost.link);
		},
		edit() {
			if (Object.keys(this.propPost.json).length > 0) {
				this.$emit('editPost', {
					id: this.propPost.id,
					link: this.propPost.link,
					message: this.propPost.message,
					json: this.propPost.json,
				});
			} else {
				this.$emit('editPost', {
					id: this.propPost.id,
					link: this.propPost.link,
					message: this.propPost.message,
					json: null,
				});
			}
		},
		open(url) {
			window.open(url, '_blank').focus();
		},
		setYoutubeParams(url) {
			let params = {};
			if (url.pathname.includes('/embed/')) {
				params.id = url.pathname.split('/embed/').pop();
			} else if (url.hostname == 'youtu.be') {
				params.id = this.$validator.escape(url.pathname.replace('/', ''));
			} else {
				params.id = url.searchParams.get('v');
			}
			let start = url.searchParams.get('start') || url.searchParams.get('t');
			let end = url.searchParams.get('end');
			//let loop = url.searchParams.get('loop')
			params.settings = `?start=${this.$validator.escape(start || 'null')}&end=${this.$validator.escape(end || 'null')}&modestbranding=2&rel=0&enablejsapi=1`;
			this.linkParams = params;
			return params;
		},
		setSoundcloudParams(url) {
			let params = {};
			let media = url.pathname;
			params.media = encodeURIComponent(media);
			params.color = encodeURIComponent(url.searchParams.get('color')) || '%23ff5500';
			params.autoplay = false;
			params.hide_related = encodeURIComponent(url.searchParams.get('hide_related')) || false;
			params.show_comments = encodeURIComponent(url.searchParams.get('show_comments')) || true;
			params.show_reposts = encodeURIComponent(url.searchParams.get('show_reposts')) || true;
			params.show_user = false;
			params.show_teaser = encodeURIComponent(url.searchParams.get('show_teaser')) || true;
			params.visual = encodeURIComponent(url.searchParams.get('visual')) || true;
			params.url = `https://w.soundcloud.com/player/?url=${params.media}&color=${params.color}&auto_play=${params.autoplay}&hide_related=${params.hide_related}&show_comments=${params.show_comments}&show_reposts=${params.show_reposts}&show_user=${params.show_user}&show_teaser=${params.show_teaser}&visual=${params.visual}`;
			//
			this.linkParams = params;
			return params;
			/*
      <iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/34019569&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true">
      </iframe>
      <div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;">
      <a href="https://soundcloud.com/the-bugle" title="The Bugle" target="_blank" style="color: #cccccc; text-decoration: none;">The Bugle</a> · 
      <a href="https://soundcloud.com/the-bugle/bugle-179-playas-gon-play" title="Bugle 179 - Playas gon play" target="_blank" style="color: #cccccc; text-decoration: none;">Bugle 179 - Playas gon play</a>
      </div> */
		},
		setSpotifyParams(url) {
			let params = {};
			let compactHeight = 80;
			let normalHeight = 380;
			let type = url.pathname.split('/')[1];
			let id = url.pathname.split('/')[2];
			params.id = encodeURIComponent(id);
			params.type = encodeURIComponent(type);
			params.height = type == 'track' ? compactHeight : normalHeight;
			params.url = `https://open.spotify.com/embed/${params.type}/${params.id}`;
			this.linkParams = params;
			return params;
		},
		setRedditParams(url) {
			//<iframe id="reddit-embed" src="https://www.redditmedia.com/r/antiwork/comments/r769cm/the_protestant_work_ethic_is_stupid/?ref_source=embed&amp;ref=share&amp;embed=true&amp;theme=dark" sandbox="allow-scripts allow-same-origin allow-popups" style="border: none;" height="527" width="640" scrolling="no"></iframe>
			//https://www.redditmedia.com/r/antiwork/comments/r769cm/the_protestant_work_ethic_is_stupid/
			let params = {};
			params.media = url.pathname.endsWith('/') ? url.pathname : url.pathname.concat('/');
			params.theme = this.$colorMode.value == 'dark' ? '&theme=dark' : '';
			params.url = `https://www.redditmedia.com${params.media}?embed=true${params.theme}&showmedia=false`;
			this.linkParams = params;
			return params;
		},
		setImgurParams(url) {
			let params = {};
			params.url = url.href;
			params.id = url.pathname;
			this.linkParams = params;
			return params;
		},
		setTedParams(url) {
			let params = {};
			params.id = url.pathname;
			params.url = 'https://embed.ted.com'.concat(params.id);
			this.linkParams = params;
			return params;
		},
	},
	computed: {
		link: function () {
			let url = new URL(this.$stringify(this.propPost.link.url, true));
			return url;
		},
		iframe() {
			let iframe = null;
			if (this.propPost.hasOwnProperty('link')) {
				try {
					let container = JSON.parse(this.propPost.link.iframe);
					iframe = container.html;
				} finally {
					return iframe;
				}
			}
			return null;
		},
		output() {
			if (this.propPost.hasOwnProperty('json')) {
				if (Object.keys(this.propPost.json).length > 0) {
					let html = generateHTML(this.propPost.json, [StarterKit]);
					return html;
				}
			}
			return null;
		},
		linkType() {
			if (this.linkArrays.youtube.includes(this.link.hostname)) {
				let falsePaths = ['shorts'];
				let firstPath = this.link.pathname.split('/')[1];
				if (!falsePaths.includes(firstPath)) {
					this.setYoutubeParams(this.link);
					return 'youtube';

					// https://www.youtube.com/embed/0zM3nApSvMg
					// http://youtube.com/watch?v=oTJRivZTMLs
					// https://youtu.be/0zM3nApSvMg
					// https://youtu.be/0zM3nApSvMg?t=1
					// https://www.youtube-nocookie.com/embed/0zM3nApSvMg?start=1

					// https://www.youtube.com/shorts/Veiy0KWY5G0 --- EMBEDDING NOT SUPPORTED
				}
			} else if (this.linkArrays.soundcloud.includes(this.link.hostname)) {
				let falsePaths = ['pages', 'discover'];
				let firstPath = this.link.pathname.split('/')[1];
				if (!falsePaths.includes(firstPath)) {
					this.setSoundcloudParams(this.link);
					return 'soundcloud';
				}
				// https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/the-bugle/bugle-179-playas-gon-play&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true
				// https://soundcloud.com/the-bugle/bugle-179-playas-gon-play
			} else if (this.linkArrays.spotify.includes(this.link.hostname)) {
				let truePaths = ['track', 'album', 'artist', 'playlist', 'user'];
				let firstPath = this.link.pathname.split('/')[1];
				if (truePaths.includes(firstPath)) {
					this.setSpotifyParams(this.link);
					return 'spotify';
				}
			} else if (this.linkArrays.reddit.includes(this.link.hostname)) {
				let truePaths = ['r'];
				let firstPath = this.link.pathname.split('/')[1];
				if (truePaths.includes(firstPath)) this.setRedditParams(this.link);
				return 'reddit';
			} else if (this.linkArrays.imgur.includes(this.link.hostname)) {
				let falsePaths = ['upload', 'emerald', 'leaderboard', 'user', 'search'];
				let firstPath = this.link.pathname.split('/')[1];
				if (!falsePaths.includes(firstPath)) {
					this.setImgurParams(this.link);
					return 'imgur';
				}
			} else if (this.linkArrays.ted.includes(this.link.hostname)) {
				let truePaths = ['talks'];
				let firstPath = this.link.pathname.split('/')[1];
				if (truePaths.includes(firstPath)) this.setTedParams(this.link);
				return 'ted';
			}
			return 'default';
		},
	},
};
</script>
