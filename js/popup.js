const hideIgnoreList = document.getElementById('hideIgnoreList');

function sendIgnoreListState(state) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			func: state => ICR.setIgnoreList(state),
			args: [state]
		}, r => console.info(r));
	});
}

chrome.storage.local.get({ hideIgnoreList: true }, result => {
	hideIgnoreList.checked = result.hideIgnoreList;
	sendIgnoreListState(result.hideIgnoreList);
});

hideIgnoreList.addEventListener('change', function () {
	const state = this.checked;
	sendIgnoreListState(state);
	chrome.storage.local.set({ hideIgnoreList: state }, () => { });
});
