const comentList = document.getElementById('cmtlst');
let hideIgnoreList = true;

function setIgnoreList(state) {
	hideIgnoreList = state;
	updateIgnoreList();
}

function updateIgnoreList(node) {
	if (!node) node = comentList;
	if (!('querySelectorAll' in node)) return;

	const ignoreComment = node.querySelectorAll('.ignoreComment');
	const ignoreCommentQuantity = ignoreComment.length
	for (const comment of ignoreComment)
		comment.classList.toggle('ICR-hideCommonList', hideIgnoreList);
	if (ignoreCommentQuantity > 0)
		console.info(`「無視リスト対象です。」を${hideIgnoreList ? '除去' : '表示'}しました。`);
}

function commentRemover(mutationList, observer) {
	mutationList.forEach(mutation => {
		if (mutation.type == 'childList')
			for (const node of mutation.addedNodes)
				updateIgnoreList(node);
	});
}

chrome.storage.local.get({ hideIgnoreList: true }, result => setIgnoreList(result.hideIgnoreList));

const observer = new MutationObserver(commentRemover);
observer.observe(comentList, { childList: true });
addEventListener('beforeunload', () => observer.disconnect());

window.ICR = { setIgnoreList: setIgnoreList };
