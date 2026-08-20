/** @type {import('next').NextConfig} */
const packageJson = require('./package.json');

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
