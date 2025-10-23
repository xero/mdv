import { defineConfig } from 'vite'
import path from 'node:path';

export default ({ mode }) => {
	const versionBump = () => Date.now().toString();
	return defineConfig({
		root: './src',
		base: './', // output relative urls
		build: {
			chunkSizeWarningLimit: 800,
			emptyOutDir: true,
			outDir: '../dist',
			assetsDir: '', // place all assets relatively to the root of `outDir`
			assetsInlineLimit: 1000000,
			target: 'es2022',
			minify: 'terser',
			terserOptions: {
				compress: {
					drop_console: false
				}
			},
			sourcemap: process.env.NODE_ENV !== 'production',
			rollupOptions: {
				input: {
					index: path.resolve('./src', 'index.html'),
				},
				output: {
					// hash core file names for cache busting
					entryFileNames: `editor-[hash].js`,
					assetFileNames: assetInfo => {
						const assetName = assetInfo.name || assetInfo.names?.[0];
						if (!assetName) return '';
						const info = assetName.split('.');
						const ext = info[info.length - 1];
						if (assetName === 'index.css') {
							return `stylez-[hash].css`;
						}
						return `[name].${ext}`;
					},
				},
			},
		},
	})
};
