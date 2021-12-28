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

function buildIDItem(userId) {
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.id = userId;
	checkbox.checked = true;
	checkbox.addEventListener('change', function () {
		const userId = this.id;
		const state = this.checked;
		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id },
				func: (userId, state) => ICR.updateIgnoreUser(userId, state),
				args: [userId, state]
			}, () => { });
		});
	});

	const label = document.createElement('label');
	label.appendChild(checkbox);
	label.appendChild(document.createTextNode(userId));
	return label;
}

/**
 * ページを開いた際の初期化処理
 */
chrome.storage.local.get({ hideIgnoreList: true, ignoreUsers: [] }, result => {
	hideIgnoreList.checked = result.hideIgnoreList;
	if (result.ignoreUsers.constructor.name == 'Array') {
		if (result.ignoreUsers.length > 0) {
			for (const user of result.ignoreUsers)
				userList.appendChild(buildIDItem(user));
		} else {
			const span = document.createElement('span');
			span.className = 'noEntry';
			span.textContent = '誰も登録されていません。';
			userList.appendChild(span);
		}
	}
});
