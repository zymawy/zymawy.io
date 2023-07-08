/* eslint-disable @typescript-eslint/no-use-before-define */

// Get Markdown from the Washing code book repo

// TODO: Fix link generation: Cannot generate link to #avoid-conditions
// TODO: Convert to TypeScript

import { execSync } from 'child_process';
import fs from 'fs-extra';
import { globSync } from 'glob';
import matter from 'gray-matter';
import _ from 'lodash';

const REPO_TAR_GZ =
	'https://codeload.github.com/sapegin/washingcode-book/tar.gz/master';
const REPO_DIR = 'washingcode-book-master';
const DEST_DIR = 'src/content/blog';
const DATA_DIR = 'src/data';

const read = (file) => fs.readFileSync(file, 'utf8');

const readChapter = (file) => read(`${REPO_DIR}/manuscript/${file}.md`);

const getFrontmatter = (contents) => contents.match(/^---[\S\s]*?---/)[0];

const getPostTitle = (post) =>
	_.upperFirst(post.data.title.replace('Washing your code: ', ''));

const getSlug = (post) =>
	`${post.file.replace(/^src\/content\/blog\//, '').replace(/\.md$/, '')}`;

const getUrl = (post) => `/blog/${getSlug(post)}/`;

const stripIds = (contents) => contents.replace(/^\{#.*\}$/gm, '');

const stripTitle = (contents) => contents.replace(/^#+ .*$/m, '');

const getTitle = (contents) => contents.match(/^#+ (.*?)$/m)[1];

const downgradeHeadings = (contents) => contents.replace(/^##(#+) /gm, '$1 ');

const updateLinks = (contents, post, allPosts) =>
	contents.replace(/\[(.*?)\]\(#(.*?)\)/g, ($, title, anchor) => {
		const bookPost = allPosts.find((p) => getSlug(p) === anchor);

		if (bookPost) {
			return `[${title}](${getUrl(bookPost)})`;
		}

		console.error(`[BOOK] 🦀 Cannot generate link to #${anchor}`);
		return title;
	});

const updateImages = (contents) =>
	contents.replace(/]\(images\//, '](/images/');

console.log('[BOOK] Downloading source files...');

execSync(`curl "${REPO_TAR_GZ}" | tar xz`);

console.log();
console.log('[BOOK] Reading files...');

const files = globSync(`${DEST_DIR}/*.md`);
const allPosts = files.map((filepath) => {
	console.log(`[BOOK] 🤜 ${filepath}`);
	const contents = read(filepath);
	const post = matter(contents);
	return {
		...post,
		file: filepath,
		source: contents,
	};
});
const bookPosts = allPosts.filter((x) => x.data.source);

console.log();
console.log('[BOOK] Syncing files...');

const postLinks = {};

bookPosts.forEach((post) => {
	console.log(`[BOOK] 👉 ${post.file}`);

	const chapterFile = post.data.source.replace('washing-code/', '');

	postLinks[chapterFile] = getUrl(post);

	const bookContent = readChapter(chapterFile);

	const contents = `${getFrontmatter(post.source)}

${updateLinks(
	downgradeHeadings(stripTitle(stripIds(updateImages(bookContent)))),
	post,
	bookPosts
).trim()}

---

Read other sample chapters of the book:

${bookPosts
	.map((p) =>
		p.file === post.file
			? `- _${getPostTitle(p)} (*this post*)_`
			: `- [${getPostTitle(p)}](${getUrl(p)})`
	)
	.join('\n')}
`;

	fs.writeFileSync(post.file, contents);
});

console.log();
console.log('[BOOK] Syncing table of contents...');

const toc = [];

const tocRaw = read(`${REPO_DIR}/manuscript/Book.txt`);
const tocLines = tocRaw.split('\n').filter((x) => x.trim());

tocLines.forEach((line) => {
	const fileName = line.replace(/\.md$/, '');
	const content = readChapter(fileName);
	const title = getTitle(stripIds(content));

	toc.push({
		// fileName,
		title,
		url: postLinks[fileName],
	});
});

fs.writeFileSync(`${DATA_DIR}/book.json`, JSON.stringify(toc, null, 2));

console.log('[BOOK] Done 🦜');
