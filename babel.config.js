module.exports = {
  presets: ['@babel/env'],
  plugins: [
    [
      '@babel/plugin-proposal-pipeline-operator',
      {
        proposal: 'minimal'
      }
    ]
  ]
};
