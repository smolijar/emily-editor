import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import codemirror from 'codemirror';

configure({ adapter: new Adapter() });
global.CodeMirror = codemirror;
