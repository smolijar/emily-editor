import bootstrap from './boostrap';
import asciidoc from './asciidoc';
import markdown from './markdown';

const generateGeneralMode = name => bootstrap({
  name,
  convert: () => ({ html: '<em>Preview not available.</em>' }),
  isLml: false,
});

export default (name) => {
  switch (true) {
    case !!name.match(/\.(adoc|asciidoc|ad)$/):
      return asciidoc;
    case !!name.match(/\.(md|markdown)$/):
      return markdown;
    default:
      return generateGeneralMode(name);
  }
};
