import axios from 'axios';
import _ from 'lodash';
import validator from 'validator';
import hcaptcha from 'hcaptcha';
const mql = require('@microlink/mql');

export default (context, inject) => {
  const hSecret = context.$config.hcaptchaSecret;
	const setLink = async function (link) {
		var gqlObject = '';
		var gqlObject = {
			url: null,
			title: null,
			image: null,
			description: null,
			favicon: null,
			author: null,
			iframe: null,
			lang: null,
			publisher: null,
			json: null,
		};
		var encodedUrl = encodeURIComponent(link);
		//Validate and sterilize before this function
		const hasuraKey = context.$config.hasuraSecret;
		const hasuraHeaders = {
			'x-hasura-admin-secret': hasuraKey,
			'Content-Type': 'application/json',
		};
		const microData = await mql(link, { meta: true, iframe: { maxHeight: 250 }, palette: true });

		if (microData.status != 'success') {
			return false;
		}
		const md = microData.data; //hybridGraph

		//Create a GraphQL Object from HybridGraph's provided values
		if (_.has(md, 'url')) gqlObject.url = encodedUrl;
		if (_.has(md, 'title')) gqlObject.title = md.title;
		if (_.has(md, 'image.url')) gqlObject.image = md.image.url;
		if (_.has(md, 'description')) gqlObject.description = md.description;
		if (_.has(md, 'logo.url')) gqlObject.favicon = md.logo.url;
		if (_.has(md, 'author')) gqlObject.author = md.author;
		if (_.has(md, 'iframe')) gqlObject.iframe = JSON.stringify(md.iframe);
		if (_.has(md, 'lang')) gqlObject.lang = md.lang;
		if (_.has(md, 'publisher')) gqlObject.publisher = md.publisher;
		gqlObject.json = JSON.stringify(microData.data);

		//Update or Insert (Upsert) received link information to Hasura links
		const linkQuery = {
			query: `
				mutation upsert_link(
					$image: String!, 
					$favicon: String!, 
					$description: String!, 
					$title: String!, 
					$url: String!, 
					$author: String!, 
					$lang: String!, 
					$publisher: String!, 
					$iframe: jsonb!, 
					$json: jsonb!
				) {
					insert_links (
						objects: {
							description: $description, 
							favicon: $favicon, 
							image: $image, 
							title: $title, 
							url: $url, 
							author: $author, 
							iframe: $iframe, 
							lang: $lang, 
							publisher: $publisher, 
							json: $json
						},
						on_conflict: {
							constraint: links_url_key,
							update_columns: [title, favicon, image, description, json, author, iframe, lang, publisher]
						}
					) {
						returning {
							url
						}
					}
				}`,
			variables: {
				image: gqlObject.image,
				favicon: gqlObject.favicon,
				description: gqlObject.description,
				title: gqlObject.title,
				url: gqlObject.url,
				author: gqlObject.author,
				iframe: gqlObject.iframe,
				lang: gqlObject.lang,
				publisher: gqlObject.publisher,
				json: gqlObject.json,
			},
		};
		const response2 = await axios({
			method: 'POST',
			timeout: 15000,
			url: context.$config.hasuraGraphQL,
			headers: hasuraHeaders, //{'X-Requested-With': 'XMLHttpRequest'}
			data: linkQuery,
		});

		//return result form Upsert, contains: title, url, image, description, favicon
		return encodedUrl;
	};

	const stringify = function (string, url = false) {
		//returns escaped string, decoded url or FALSE
		if (typeof string === 'string') {
			if (url) return decodeURIComponent(string);
			else return validator.unescape(string);
		} else {
			return false;
		}
	};

	const hVerify = async function (token) {
		hcaptcha
			.verify(hSecret, token)
			.then((data) => {
				if (data.success === true) {
					return true;
				} else {
					return false;
				}
			})
			.catch(console.error);
	};

	// Inject $setLink(link) and $validator in Vue, context and store.
	inject('setLink', setLink);
	inject('validator', validator);
	inject('stringify', stringify);
	inject('hVerify', hVerify);
	inject('hSitekey', 'f9d413bd-39c5-4ffe-80df-2bee0a7b92f8');
	inject('lodash', _);
};
