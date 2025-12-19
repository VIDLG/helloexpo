const { withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { getProperties } = require('properties-file');
const { PropertiesEditor } = require('properties-file/editor');

const CHINA_MAVEN_REPOS = `
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
`;

const withMirrorMavenRepos = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;
      if (!buildGradle.includes('https://maven.aliyun.com/repository/public')) {
        const buildscriptRegex = /buildscript\s*\{[\s\S]*?repositories\s*\{/;
        buildGradle = buildGradle.replace(buildscriptRegex, (match) => {
          return `${match}${CHINA_MAVEN_REPOS}`;
        });

        const allprojectsRegex = /allprojects\s*\{[\s\S]*?repositories\s*\{/;
        buildGradle = buildGradle.replace(allprojectsRegex, (match) => {
          return `${match}${CHINA_MAVEN_REPOS}`;
        });
      }
      config.modResults.contents = buildGradle;
    } else {
      console.warn('withAndroidMirrors: Only Groovy build.gradle is supported');
    }
    return config;
  });
};

const withMirrorGradleWrapper = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'gradle', 'wrapper', 'gradle-wrapper.properties');
      const content = fs.readFileSync(file, 'utf8');
      const props = getProperties(content);

      let distributionUrl = props['distributionUrl'];
      if (distributionUrl) {
        // Replace services.gradle.org with mirrors.cloud.tencent.com/gradle
        const newDistributionUrl = distributionUrl.replace(
          /https\\?:\/\/services\.gradle\.org\/distributions\//,
          'https://mirrors.cloud.tencent.com/gradle/'
        );

        if (newDistributionUrl !== distributionUrl) {
            const editor = new PropertiesEditor(content);
            editor.update('distributionUrl', {
                newValue: newDistributionUrl
            });
            fs.writeFileSync(file, editor.format());
        }
      }

      return config;
    },
  ]);
};

const withAndroidMirrors = (config) => {
  config = withMirrorMavenRepos(config);
  config = withMirrorGradleWrapper(config);

  return config;
};



module.exports = withAndroidMirrors;
