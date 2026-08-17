module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin must stay last — it needs to process
    // code after all other transforms have run.
    plugins: ['react-native-worklets/plugin'],
  };
};
