importScripts("dictionary.js");


const rank = word => {
	const regexSource = word
		.split("")
		.map(letter => {
			if (letter === "#")
				return "s";
			return RegExp.escape(letter) + "(.*)";
		})
		.join("");
	const regex = new RegExp(`^${regexSource}$`);
	const matches = DICTIONARY
		.map(word => {
			let nonEmpty = 0;
			let total = 0;
			const match = word.match(regex);
			if (!match) return null;
			for (let i = 1; i < match.length; i++) {
				const group = match[i];
				if (group) nonEmpty++;
				total += group.length;
			}
			return { word, nonEmpty, total };
		})
		.filter(Boolean)
		.sort((a, b) => a.total - b.total)
		.sort((a, b) => a.nonEmpty - b.nonEmpty)
		.map(({ word }) => word);
	return matches;
};

const matchCase = (target, current) => {
	if (target.toUpperCase() === target)
		return current.toUpperCase();
	if (target[0].toUpperCase() === target[0])
		return current[0].toUpperCase() + current.slice(1);
	return current;
};

addEventListener("message", event => {
	const target = event.data;
	const options = rank(target.toLowerCase())
		.slice(0, 20)
		.map(word => matchCase(target, word));
	postMessage(options);
});