export const environment = 'production';

export const buildOptions = {
  sourcemap: false,
  minify: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
};
