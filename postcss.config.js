import cssnano from 'cssnano';

export default {
  plugins: [
    () => {
			console.log(`\n\x1b[36m[PostCSS] \x1b[0mbuilding styles: \x1b[35mcssnano \x1b[34m(advanced)\x1b[0m`);
    },
    cssnano({
      preset: 'advanced',
    }),
  ],
};
