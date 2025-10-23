import './style.css';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { tokyoNightDay } from '@fsegurai/codemirror-theme-tokyo-night-day';
import { tokyoNightStorm } from '@fsegurai/codemirror-theme-tokyo-night-storm';
import showdown from 'showdown';

const D = document;
const STORAGE_KEY = 'markdown-editor-content';
const defaultContent = '';
const initialContent = localStorage.getItem(STORAGE_KEY) || defaultContent;

showdown.setFlavor('github');
const converter = new showdown.Converter();

const debounce = (func, delay) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}

const saveToLocalStorage = (content) => {
	localStorage.setItem(STORAGE_KEY, content);
}

const debouncedSave = debounce(saveToLocalStorage, 300);

const updatePreview = (content) => {
	const previewElement = D.querySelector('#preview');
	const html = converter.makeHtml(content);
	previewElement.innerHTML = html;
}

let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDarkModeOverride = localStorage.getItem('darkModeOverride');
if (isDarkModeOverride !== null) {
	prefersDark = isDarkModeOverride === 'true';
}

const themeCompartment = new Compartment();
const extensions = [
	basicSetup,
	markdown(),
	themeCompartment.of(prefersDark ? tokyoNightStorm : tokyoNightDay),
	EditorView.updateListener.of(update => {
		if (update.docChanged) {
			const content = update.state.doc.toString();
			updatePreview(content);
			debouncedSave(content);
		}
	}),
];

const editor = new EditorView({
	doc: initialContent,
	extensions: extensions,
	parent: D.querySelector('#editor'),
});

updatePreview(initialContent);

const dragbar = D.querySelector('#dragbar');
const editorPanel = D.querySelector('#editor');
const content = D.querySelector('#content');

let isDragging = false;
let startX = 0;
let startEditorWidth = 0;

const startDrag = (clientX) => {
	isDragging = true;
	startX = clientX;
	startEditorWidth = editorPanel.offsetWidth;
	D.body.style.userSelect = 'none';
	D.body.style.cursor = 'col-resize';
}

const doDrag = (clientX) => {
	if (!isDragging) {
		return;
	}

	const contentWidth = content.offsetWidth;
	const deltaX = clientX - startX;
	const newEditorWidth = startEditorWidth + deltaX;
	const minWidth = contentWidth * 0.2;
	const maxWidth = contentWidth * 0.8;
	if (newEditorWidth >= minWidth && newEditorWidth <= maxWidth) {
		const percentage = (newEditorWidth / contentWidth) * 100;
		editorPanel.style.flex = `0 0 ${percentage}%`;
	}
}

const stopDrag = () => {
	if (!isDragging) {
		return;
	}
	isDragging = false;
	D.body.style.userSelect = '';
	D.body.style.cursor = '';
}

dragbar.addEventListener('mousedown', e => {
	e.preventDefault();
	startDrag(e.clientX);
});

D.addEventListener('mousemove', e => {
	doDrag(e.clientX);
});

D.addEventListener('mouseup', () => {
	stopDrag();
});

dragbar.addEventListener(
	'touchstart',
	e => {
		e.preventDefault();
		if (e.touches.length === 1) {
			startDrag(e.touches[0].clientX);
		}
	},
	{ passive: false },
);

D.addEventListener(
	'touchmove',
	e => {
		if (isDragging && e.touches.length === 1) {
			doDrag(e.touches[0].clientX);
		}
	},
	{ passive: true },
);

D.addEventListener('touchend', () => {
	stopDrag();
});

D.addEventListener('touchcancel', () => {
	stopDrag();
});

D.querySelector('#new').addEventListener('click', () => {
	localStorage.removeItem(STORAGE_KEY);
	editor.dispatch({
		changes: {
			from: 0,
			to: editor.state.doc.length,
			insert: defaultContent,
		},
	});
});

const fullscreenButton = D.querySelector('#fullscreen');
let isFullscreen = false;

fullscreenButton.addEventListener('click', () => {
	if (!isFullscreen) {
		if (D.documentElement.requestFullscreen) {
			D.documentElement.requestFullscreen();
		} else if (D.documentElement.webkitRequestFullscreen) {
			D.documentElement.webkitRequestFullscreen();
		} else if (D.documentElement.mozRequestFullScreen) {
			D.documentElement.mozRequestFullScreen();
		} else if (D.documentElement.msRequestFullscreen) {
			D.documentElement.msRequestFullscreen();
		}
	} else {
		if (D.exitFullscreen) {
			D.exitFullscreen();
		} else if (D.webkitExitFullscreen) {
			D.webkitExitFullscreen();
		} else if (D.mozCancelFullScreen) {
			D.mozCancelFullScreen();
		} else if (D.msExitFullscreen) {
			D.msExitFullscreen();
		}
	}
});

const updateFullscreenButton = () => {
	isFullscreen = !!(
		D.fullscreenElement ||
		D.webkitFullscreenElement ||
		D.mozFullScreenElement ||
		D.msFullscreenElement
	);
	fullscreenButton.textContent = isFullscreen
		? 'Exit Full Screen'
		: 'Full Screen';
}

D.addEventListener('fullscreenchange', updateFullscreenButton);
D.addEventListener('webkitfullscreenchange', updateFullscreenButton);
D.addEventListener('mozfullscreenchange', updateFullscreenButton);
D.addEventListener('MSFullscreenChange', updateFullscreenButton);


const darkModeButton = D.querySelector('#darkmode');

const updateDarkMode = (isDark) => {
	prefersDark = isDark;
	localStorage.setItem('darkModeOverride', isDark.toString());
	D.querySelector('html').classList.toggle('dark');
	darkModeButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
	editor.dispatch({
		effects: themeCompartment.reconfigure(
			isDark ? tokyoNightStorm : tokyoNightDay,
		),
	});
}
darkModeButton.addEventListener('click', () => {
	updateDarkMode(!prefersDark);
});
updateDarkMode(prefersDark);

const openButton = D.querySelector('#open');
openButton.addEventListener('click', () => {
	const fileInput = D.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.txt,.md,.markdown,text/*';

	fileInput.addEventListener('change', e => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = event => {
				const fileContent = event.target.result;
				editor.dispatch({
					changes: {
						from: 0,
						to: editor.state.doc.length,
						insert: fileContent,
					},
				});
				updatePreview(fileContent);
			};
			reader.readAsText(file);
		}
	});

	fileInput.click();
});

D.querySelector('#save').addEventListener('click', async () => {
	const content = editor.state.doc.toString();

	if ('showSaveFilePicker' in window) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: 'D.md',
				types: [
					{
						description: 'Markdown Files',
						accept: { 'text/markdown': ['.md', '.markdown']},
					},
					{
						description: 'Text Files',
						accept: { 'text/plain': ['.txt']},
					},
				],
			});

			const writable = await handle.createWritable();
			await writable.write(content);
			await writable.close();
		} catch {
			console.error('failed to save');
		}
	} else {
		const blob = new Blob([content], { type: 'text/markdown' });

		const link = D.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'D.md';

		D.body.appendChild(link);
		link.click();

		D.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	}
});
