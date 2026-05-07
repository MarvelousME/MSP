module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
    provider: 'postgresql',
  },
  clientGenerator: {
    // optional generator config
    previewFeatures: [],
  },
};
