module.exports = {
  webpack: config => Object.assign(config, {
    node: {
      fs: 'empty', child_process: 'empty', net: 'empty', tls: 'empty',
    },
  }),
};
