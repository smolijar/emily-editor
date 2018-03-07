import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const localStorageMock = {
  setItem(key, val) {
    this[key] = `${val}`;
  },
  getItem(key) {
    return this[key];
  },
  removeItem(key) {
    delete this[key];
  },
};
Object.defineProperty(localStorageMock, 'length', {
  get() { return Object.keys(this).length - 2; },
});

global.localStorage = localStorageMock;

const xhrMockClass = () => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
});

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
