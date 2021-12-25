const comentList = document.getElementById('cmtlst');

const removeIgnoreComment = node => {
	if (!node) node = comentList;
	const ignoreComment = node.querySelectorAll('.ignoreComment');
	const ignoreCommentQuantity = ignoreComment.length
	for (const comment of ignoreComment)
		comment.parentNode.removeChild(comment);
	if (ignoreCommentQuantity > 0)
		console.info(`${ignoreCommentQuantity}つの「無視リスト対象です。」を削除しました。`);
}

const commentRemover = (mutationList, observer) => {
	mutationList.forEach(mutation => {
		if (mutation.type == 'childList')
			for (const node of mutation.addedNodes)
				removeIgnoreComment(node);
	});
};

removeIgnoreComment();

const observer = new MutationObserver(commentRemover);
observer.observe(comentList, { childList: true });
addEventListener('beforeunload', () => {
	observer.disconnect();
});