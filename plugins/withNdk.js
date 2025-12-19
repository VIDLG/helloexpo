const { withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { getProperties } = require('properties-file');

function detectNdkVersion() {
  const ndkPath = process.env.ANDROID_NDK_HOME || process.env.NDK_HOME;
  if (!ndkPath) {
    return null;
  }

  try {
    const sourcePropsPath = path.join(ndkPath, 'source.properties');
    if (fs.existsSync(sourcePropsPath)) {
      const content = fs.readFileSync(sourcePropsPath, 'utf8');
      const props = getProperties(content);
      const revision = props['Pkg.Revision'];
      if (revision) {
        return revision.split('-')[0];
      }
    }
    const pathParts = ndkPath.split(/[\\\/]/);
    const lastPart = pathParts[pathParts.length - 1];
    if (/^\d+\.\d+\.\d+/.test(lastPart)) {
      return lastPart;
    }
  } catch (e) {
    console.warn('[withNdk] Failed to detect NDK version:', e.message);
  }
  return null;
}

const withNdk = (config, props = {}) => {
  const ndkVersion = props.ndkVersion || detectNdkVersion();

  if (ndkVersion) {
    console.log(`[withNdk] Using NDK version: ${ndkVersion}`);
  }

  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;
      if (ndkVersion) {
        const ndkVersionLine = `ndkVersion = "${ndkVersion}"`;

        if (buildGradle.includes('ext {')) {
          if (buildGradle.includes('ndkVersion =')) {
            buildGradle = buildGradle.replace(/ndkVersion\s*=\s*["'].*?["']/, ndkVersionLine);
          } else {
            buildGradle = buildGradle.replace('ext {', `ext {\n        ${ndkVersionLine}`);
          }
        } else {
          // No ext block, add it to buildscript
          if (buildGradle.includes('buildscript {')) {
            buildGradle = buildGradle.replace('buildscript {', `buildscript {\n    ext {\n        ${ndkVersionLine}\n    }`);
          } else {
              // Fallback if buildscript is missing (unlikely in valid project)
              buildGradle = `buildscript {\n    ext {\n        ${ndkVersionLine}\n    }\n}\n` + buildGradle;
          }
        }
      }
      config.modResults.contents = buildGradle;
    } else {
      console.warn('withNdk: Only Groovy build.gradle is supported');
    }
    return config;
  });
};

module.exports = withNdk;


