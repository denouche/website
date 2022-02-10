const htmlmin = require("html-minifier");
const fetch = require("node-fetch")

module.exports = function (eleventyConfig) {

  eleventyConfig.addCollection("partners", async () => {
    const sponsors = await fetch("https://cms4partners-ce427.nw.r.appspot.com/events/vzbfowsExm54SrWLtxA5").then(res => res.json())
    return sponsors.partners;
  });

  eleventyConfig.addCollection("config", function () {
    return require("./data/config.json");
  });

  eleventyConfig.addCollection("speakers", function () {
    return require("./data/agenda.json").speakers;
  });

  eleventyConfig.addCollection("talks", function () {
    const config = require("./data/agenda.json")
    const talks = Object.entries(config.talks)
    const oTalks = talks.map(([_, talks]) => {
      return [_, talks.map(talk => {
        return {
          ...talk,
          speakers: talk.speakers?.map(speaker => config.speakers.find(({uid}) => uid === speaker)?.displayName).join(', ')
        }
      })]
    })

    return oTalks;
  });


  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addPassthroughCopy("css/*.ttf");
  eleventyConfig.addPassthroughCopy("css/*.woff");
  eleventyConfig.addPassthroughCopy("css/*.woff2");
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addPassthroughCopy("js/*.*");
  eleventyConfig.addPassthroughCopy("img/*.*");
  eleventyConfig.addPassthroughCopy("partenaire.pdf");

  eleventyConfig.setTemplateFormats(["md", "html", "rss", "njk"]);

  eleventyConfig.addTemplateFormats("css");

  const CleanCSS = require("clean-css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async (inputContent) => {
      return async () => {
        return new Promise(resolve => {
          new CleanCSS({ inline: ['remote'] }).minify(inputContent, (_, data) => {
            resolve(data.styles)
          });
        });
      };
    }
  });


  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });
};
