# Split-Screen Markdown Editor

A real-time markdown editor with live preview built using Bun.js, Vite, CodeMirror, and ShowDown.

## Features

- **Split-screen layout**: Editor on the left (50%), preview on the right (50%)
- **Live preview**: See your markdown rendered in real-time as you type
- **Syntax highlighting**: CodeMirror with markdown language support
- **Dark mode support**: Automatically adapts to system color scheme
- **Github flavored markdown**: Headers, lists, code blocks, tables, links, images, and more
- **Full Screen**: Zen mode for markdown editing
- **Local storage**: Markdown contents automatically sync to your browser storage
- **File operation**: Open and save documents to your device
- **Completely in browser**: Everything is client side and never leaves your device

## Tech Stack

- [Bun.js](https://bun.sh/) - Fast JavaScript runtime and package manager
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [CodeMirror 6](https://codemirror.net/) - Extensible code editor
- [ShowDown](https://github.com/showdownjs/showdown) - Markdown parser and compiler

## Getting Started

### Prerequisites

- [Bun](https://bun.com) installed on your system

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev
```

Open your browser and navigate to `http://localhost:5173/`

### Build

```bash
# Build for production
bun run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
bun run preview
```

## Usage

1. Start typing markdown in the left editor panel
2. See the rendered output in real-time on the right preview panel
3. The editor supports all standard markdown syntax including:
   - Headers (`#`, `##`, `###`, etc.)
   - Bold (`**text**`) and italic (`*text*`)
   - Lists (ordered and unordered)
   - Code blocks with syntax highlighting
   - Tables
   - Links and images
   - Blockquotes
   - And more!

