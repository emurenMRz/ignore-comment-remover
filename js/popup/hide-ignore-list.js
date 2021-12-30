/**
 * 公式の無視リスト関係の処理
 */

const hideIgnoreList = document.getElementById('hideIgnoreList');

hideIgnoreList.addEventListener('change', function () {
	const state = this.checked;
	sendIgnoreListState(state);
	chrome.storage.local.set({ hideIgnoreList: state }, () => { });
});

function sendIgnoreListState(state) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			func: state => ICR.setIgnoreList(state),
			args: [state]
		}, () => { });
	});
}

export function initialize(initParam) {
	hideIgnoreList.checked = initParam.hideIgnoreList;
}