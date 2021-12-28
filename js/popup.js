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

/**
 * ローカル無視リスト関係の処理
 */

const userList = document.getElementById('userList');

function onChange() {
	const data = { id: this.id, name: this.dataset.name };
	const state = this.checked;
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			func: (data, state) => ICR.updateIgnoreUser(data, state),
			args: [data, state]
		}, () => { });
	});
}

function buildIDItem(id, name) {
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.id = id;
	checkbox.dataset.name = name;
	checkbox.checked = true;
	checkbox.addEventListener('change', onChange);

	const label = document.createElement('label');
	label.appendChild(checkbox);
	label.appendChild(document.createTextNode(name));
	return label;
}

/**
 * ページを開いた際の初期化処理
 */
chrome.storage.local.get({ hideIgnoreList: true, ignoreUsers: {} }, result => {
	hideIgnoreList.checked = result.hideIgnoreList;

	const userIds = Object.keys(result.ignoreUsers);
	if (userIds.length > 0) {
		console.info(userIds);
		for (const id of userIds)
			userList.appendChild(buildIDItem(id, result.ignoreUsers[id]));
	} else {
		const span = document.createElement('span');
		span.className = 'noEntry';
		span.textContent = '誰も登録されていません。';
		userList.appendChild(span);
	}
});
