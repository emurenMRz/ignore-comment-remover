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

export function initialize(initParam) {
	const userIds = Object.keys(initParam.ignoreUsers);
	if (userIds.length > 0) {
		console.info(userIds);
		for (const id of userIds)
			userList.appendChild(buildIDItem(id, initParam.ignoreUsers[id]));
	} else {
		const span = document.createElement('span');
		span.className = 'noEntry';
		span.textContent = '誰も登録されていません。';
		userList.appendChild(span);
	}
}