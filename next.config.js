module.exports = {
  webpack: config => Object.assign(config, { node: { fs: 'empty' } }),
};
