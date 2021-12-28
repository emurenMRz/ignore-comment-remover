const comentList = document.getElementById('cmtlst');

/**
 * 公式の無視リスト関係の処理
 */

class IgnoreList {
	static hide = true;

	static setState(state) {
		IgnoreList.hide = state;
		IgnoreList.update();
	}

	static update(node) {
		if (!node) node = comentList;
		if (!('querySelectorAll' in node)) return;

		const ignoreComment = node.querySelectorAll('.ignoreComment');
		if (ignoreComment.length > 0) {
			for (const comment of ignoreComment)
				comment.classList.toggle('ICR-hideCommonList', IgnoreList.hide);
			console.info(`「無視リスト対象です。」を${IgnoreList.hide ? '除去' : '表示'}しました。`);
		}
	}
}

/**
 * ローカル無視リスト関係の処理
 */

class LocalIgnoreList {
	static ignoreUsers = {};

	static extractWriterData(comment) {
		const writer = comment.querySelector('.comWriter');
		if (!writer)
			return null;
		const a = writer.firstElementChild;
		return { name: a.lastChild.data, id: a.dataset.user };
	}

	static initialize() {
		for (const comment of comentList.querySelectorAll('div.comment')) {
			const data = LocalIgnoreList.extractWriterData(comment);
			if (!data)
				continue;
			const menuList = comment.querySelector('.comMenu>.comMenuList');
			if (menuList)
				menuList.appendChild(LocalIgnoreList.buildMenuItem(data));
		}
	}

	static setUsers(users) {
		LocalIgnoreList.ignoreUsers = users;
		LocalIgnoreList.update();
	}

	static updateUser(user, state) {
		if (state)
			LocalIgnoreList.ignoreUsers[user.id] = user.name;
		else
			delete LocalIgnoreList.ignoreUsers[user.id];
		LocalIgnoreList.update();
	}

	static update(node) {
		chrome.storage.local.set({ ignoreUsers: LocalIgnoreList.ignoreUsers }, () => { });
		const ids = Object.keys(LocalIgnoreList.ignoreUsers);

		if (!node) node = comentList;
		for (const comment of node.querySelectorAll('div.comment')) {
			const data = LocalIgnoreList.extractWriterData(comment);
			if (!data)
				continue;
			const menuList = comment.querySelector('.comMenu>.comMenuList');
			if (menuList && menuList.lastElementChild?.dataset?.type != 'add-ignore-user')
				menuList.appendChild(LocalIgnoreList.buildMenuItem(data));
			comment.classList.toggle('ICR-hideExtendedList', ids.indexOf(data.id) >= 0);
		}
	}

	static buildMenuItem(data) {
		const a = document.createElement('a');
		a.textContent = '無視する';
		a.href = 'javascript:void(0)';
		a.dataset.name = data.name;
		a.dataset.userId = data.id;
		a.addEventListener('click', LocalIgnoreList.appendIgnoreUser);
		const li = document.createElement('li');
		li.dataset.type = 'add-ignore-user';
		li.appendChild(a);
		return li;
	}

	static appendIgnoreUser() {
		const userId = this.dataset.userId;
		const ids = Object.keys(LocalIgnoreList.ignoreUsers);
		if (ids.indexOf(userId) >= 0)
			return;
		const name = this.dataset.name;
		LocalIgnoreList.ignoreUsers[userId] = name;
		LocalIgnoreList.update();
	}
}

/**
 * ページを開いた際の初期化処理
 */

LocalIgnoreList.initialize();

chrome.storage.local.get({ hideIgnoreList: true, ignoreUsers: {} }, result => {
	IgnoreList.setState(result.hideIgnoreList);
	LocalIgnoreList.setUsers(result.ignoreUsers);
});

const observer = new MutationObserver((mutationList, observer) => {
	mutationList.forEach(mutation => {
		if (mutation.type == 'childList')
			for (const node of mutation.addedNodes) {
				IgnoreList.update(node);
				LocalIgnoreList.update(node);
			}
	});
});
observer.observe(comentList, { childList: true });
addEventListener('beforeunload', () => observer.disconnect());

window.ICR = {
	setIgnoreList: IgnoreList.setState,
	updateIgnoreUser: LocalIgnoreList.updateUser
};
