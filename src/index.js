import Emily from './components/Editor';
import asciidoc from './modes/asciidoc';
import markdown from './modes/markdown';
import generateMode from './modes/generateMode';

const modes = { asciidoc, markdown };
export default Emily;
export { modes, generateMode };