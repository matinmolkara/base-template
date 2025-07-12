/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");
const nextConfig = {};

export default nextConfig;

const sentryWebpackPluginOptions = {
  silent: true,
  org: "your-org",
  project: "your-project",
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
