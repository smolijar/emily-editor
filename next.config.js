module.exports = {
  webpack: config => ({
    ...config,
    node: { fs: 'empty' },
  }),
};
