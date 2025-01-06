export function debounce(fn, delay) {
	var timeoutID = null;
	return function () {
		clearTimeout(timeoutID);
		var args = arguments;
		var that = this;
		timeoutID = setTimeout(function () {
			fn.apply(that, args);
		}, delay);
	};
}

export function throttle(fn, delay) {
	var timeoutID = null;
	var execute = true;
	return function () {
		var args = arguments;
		var that = this;
		if (execute == true && timeoutID == null) {
			execute = false;
			fn.apply(that, args);
		}
		timeoutID = setTimeout(function () {
			execute = true;
			timeoutID = null;
		}, delay);
	};
}

export function getArrayChanges(before, after) {
	let added = after.filter((x) => !before.includes(x));
	let removed = before.filter((x) => !after.includes(x));
	let count = {
		before: before.length,
		after: after.length,
		added: added.length,
		removed: removed.length,
	};
	let exist = count.added + count.removed > 0 ? true : false;
	return {
		added,
		removed,
		count,
		exist,
	};
}
