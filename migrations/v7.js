import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
// import _ from 'lodash';
let matchings;

describe('Matching - v6.0.0 to v7.2.0', async () => {
  whereFromPlugin('Matching - from v6.0.0', { name: 'adapt-contrib-matching', version: '<7.2.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - update instruction attribute', async content => {
    const originalInstruction = '';
    matchings.forEach(matching => {
      if (matching.instruction === originalInstruction) {
        matching.instruction = 'Choose an option from each dropdown list and select Submit.';
      }
    });
    return true;
  });
  checkContent('Matching - check instruction attribute', async content => {
    const isValid = matchings.every(({ instruction }) => {
      return instruction === 'Choose an option from each dropdown list and select Submit.';
    });
    if (!isValid) throw new Error('Matching - instruction attribute invalid');
    return true;
  });
  updatePlugin('Matching - update to v7.2.0', { name: 'adapt-contrib-matching', version: '7.2.0', framework: '>=5.19.1' });
});

describe('Matching - v7.2.0 to v7.2.1', async () => {
  whereFromPlugin('Matching - from v7.2.1', { name: 'adapt-contrib-matching', version: '<7.2.1' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - add ariaQuestion attribute', async content => {
    matchings.forEach(matching => (matching.ariaQuestion = ''));
    return true;
  });
  checkContent('Matching - check ariaQuestion attribute', async content => {
    const isValid = matchings.every(matching => matching.ariaQuestion === '');
    if (!isValid) throw new Error('Matching - ariaQuestion attribute invalid');
    return true;
  });
  updatePlugin('Matching - update to v7.2.1', { name: 'adapt-contrib-matching', version: '7.2.1', framework: '>=5.19.1' });
});
