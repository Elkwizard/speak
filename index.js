const $ = query => document.querySelector(query);
const $$ = query => [...document.querySelectorAll(query)];

const worker = new Worker("worker.js");

const rank = word => {
	return new Promise(resolve => {
		worker.addEventListener("message", ({ data }) => {
			resolve(data);
		}, { once: true });
		worker.postMessage(word);
	});
};

addEventListener("load", () => {
	const textInput = $("#text");
	textInput.addEventListener("input", async () => {
		const { value } = textInput;
		const match = value.match(/((?:'|[^\W\d])+)(\d+)?[\s.?!]+$/);
		if (match) { // finished word
			const [, fragment, number = ""] = match;
			const index = number ? number - 1 : 0;
			const word = (await rank(fragment))[index] ?? fragment;
			const needle = fragment + number;
			const value = textInput.value;
			const needleIndex = value.lastIndexOf(needle);
			textInput.value = value.slice(0, needleIndex) + word + value.slice(needleIndex + needle.length);
			if (value.endsWith("\n") && $("#speak").checked) {
				const line = textInput.value.split("\n").at(-2);
				speechSynthesis.speak(new SpeechSynthesisUtterance(line));
			}
		}
		const lastWord = value.match(/((?:'|[^\W\d])+)(\d+)?$/);
		if (!lastWord) return;
		const options = await rank(lastWord[1]);
		const suggestions = $("#suggestions");
		suggestions.innerHTML = "";
		for (const option of options) {
			const item = document.createElement("li");
			item.textContent = option;
			suggestions.appendChild(item);
		}
	});
});