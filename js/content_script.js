const comentList = document.getElementById('cmtlst');

// 要素に一定の高さが無いと古い書き込みの読み込みが発生しなくなるので、強制的に高さを指定する
function updatePageHeight() {
	comentList.style.height = `${document.body.clientHeight}px`;
}

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
		updatePageHeight();
	}
}

/**
 * コメント内の画像を縮小表示する関係の処理
 */

 class LimitImageSize {
	static limit = true;

	static setState(state) {
		LimitImageSize.limit = state;
		LimitImageSize.update();
	}

	static update(node) {
		if (!node) node = comentList;
		if (!('querySelectorAll' in node)) return;

		const imageInComment = node.querySelectorAll('.comImg a img');
		if (imageInComment.length > 0) {
			for (const comment of imageInComment)
				comment.classList.toggle('ICR-limitImageSize', LimitImageSize.limit);
		}
		updatePageHeight();
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
		if (!('querySelectorAll' in comentList)) return;
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
		if (!('querySelectorAll' in node)) return;
		for (const comment of node.querySelectorAll('div.comment')) {
			const data = LocalIgnoreList.extractWriterData(comment);
			if (!data)
				continue;
			const menuList = comment.querySelector('.comMenu>.comMenuList');
			if (menuList && menuList.lastElementChild?.dataset?.type != 'add-ignore-user')
				menuList.appendChild(LocalIgnoreList.buildMenuItem(data));
			comment.classList.toggle('ICR-hideExtendedList', ids.indexOf(data.id) >= 0);
		}
		updatePageHeight();
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

chrome.storage.local.get({ hideIgnoreList: true, limitImageSize: true, ignoreUsers: {} }, result => {
	IgnoreList.setState(result.hideIgnoreList);
	LimitImageSize.setState(result.limitImageSize);
	LocalIgnoreList.setUsers(result.ignoreUsers);
});

const observer = new MutationObserver((mutationList, observer) => {
	mutationList.forEach(mutation => {
		if (mutation.type == 'childList')
			for (const node of mutation.addedNodes) {
				IgnoreList.update(node);
				LimitImageSize.update(node);
				LocalIgnoreList.update(node);
			}
	});
});
observer.observe(comentList, { childList: true });
addEventListener('beforeunload', () => observer.disconnect());

window.ICR = {
	setIgnoreList: IgnoreList.setState,
	setLimitImageSize: LimitImageSize.setState,
	updateIgnoreUser: LocalIgnoreList.updateUser
};
