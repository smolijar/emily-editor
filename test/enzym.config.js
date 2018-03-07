import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const localStorageMock = {
  setItem: function (key, val) {
    this[key] = val + '';
  },
  getItem: function (key) {
    return this[key];
  },
  removeItem: function (key) {
    delete this[key];
  }
};
Object.defineProperty(localStorageMock, 'length', {
  get: function () { return Object.keys(this).length - 2; }
});

global.localStorage = localStorageMock;

const xhrMockClass = () => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
});

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
