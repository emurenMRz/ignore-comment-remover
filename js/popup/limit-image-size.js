/**
 * コメント内の画像を縮小表示する処理
 */

const limitImageSize = document.getElementById('limitImageSize');

limitImageSize.addEventListener('change', function () {
	const state = this.checked;
	sendState(state);
	chrome.storage.local.set({ limitImageSize: state }, () => { });
});

function sendState(state) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			func: state => ICR.setLimitImageSize(state),
			args: [state]
		}, () => { });
	});
}

export function initialize(initParam) {
	limitImageSize.checked = initParam.limitImageSize;
}