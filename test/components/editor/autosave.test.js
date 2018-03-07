import { autosaveStore, autosaveRetrieve } from '../../../src/components/editor/autosave';

describe('Autosave', () => {
  autosaveStore('suitcase');
  it(`Can retrieve a suitcase`, () => {
    expect(autosaveRetrieve().value).toBe('suitcase');
  });

  autosaveStore('...annnd its gone!', 'save_bank', 0);
  it(`It is gone!`, () => {
    expect(autosaveRetrieve('save_bank')).toBe(null);
  });
});
