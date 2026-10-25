export const environment = 'development';

export const buildOptions = {
  sourcemap: true,
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
};
