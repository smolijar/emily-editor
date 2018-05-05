import bootstrap from './boostrap';

export default name => bootstrap({
  name,
  convert: () => ({ html: '<em>Preview not available.</em>' }),
  isLml: false,
});
