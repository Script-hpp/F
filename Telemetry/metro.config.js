const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Use this to resolve extra Node.js modules
    extraNodeModules: {
      dgram: require.resolve('react-native-udp'),
      // Add other Node modules if necessary
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
