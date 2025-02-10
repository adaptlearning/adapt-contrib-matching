import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

let matchings;

describe('Matching - v6.0.0 to v7.2.0', async () => {
  whereFromPlugin('Matching - from v6.0.0', { name: 'adapt-contrib-matching', version: '<7.2.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  // mutateContent('Matching - add _hasItemScoring attribute', async content => {
  //   matchings.forEach(matching => { matching._hasItemScoring = false; });
  //   return true;
  // });
  // mutateContent('Matching - add _allowOnlyUniqueAnswers attribute', async content => {
  //   matchings.forEach(matching => { matching._allowOnlyUniqueAnswers = false; });
  //   return true;
  // });
  // checkContent('Matching - check _hasItemScoring attribute', async content => {
  //   const isValid = matchings.every(({ _hasItemScoring }) => _hasItemScoring === false);
  //   if (!isValid) throw new Error('Matching - _hasItemScoring attribute invalid');
  //   return true;
  // });
  // checkContent('Matching - check _allowOnlyUniqueAnswers attribute', async content => {
  //   const isValid = matchings.every(({ _allowOnlyUniqueAnswers }) => _allowOnlyUniqueAnswers === false);
  //   if (!isValid) throw new Error('Matching - _allowOnlyUniqueAnswers attribute invalid');
  //   return true;
  // });
  updatePlugin('Matching - update to v7.2.0', { name: 'adapt-contrib-matching', version: '7.2.0', framework: '>=5.19.1' });
});
