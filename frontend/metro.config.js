// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Ensure video and audio files are treated as assets
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'mp4', 'mp3', 'mov', 'avi', 'webm', 'm4v',
];

// Use a stable on-disk store
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// Reduce workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;
