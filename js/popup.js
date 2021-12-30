import { initialize as initHideIgnoreList } from './popup/hide-ignore-list.js';
import { initialize as initLimitImageSize } from './popup/limit-image-size.js';
import { initialize as initLocalIgnoreList } from './popup/local-ignore-list.js';

/**
 * ページを開いた際の初期化処理
 */
chrome.storage.local.get({ hideIgnoreList: true, limitImageSize: true, ignoreUsers: {} }, result => {
	initHideIgnoreList(result);
	initLimitImageSize(result);
	initLocalIgnoreList(result);
});
