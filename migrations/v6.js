import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
import _ from 'lodash';
let matchings;

describe('Matching - v4.2.0 to v6.0.0', async () => {
  whereFromPlugin('Matching - from v4.2.0', { name: 'adapt-contrib-matching', version: '<6.0.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - add _hasItemScoring attribute', async content => {
    matchings.forEach(matching => { matching._hasItemScoring = false; });
    return true;
  });
  mutateContent('Matching - add _allowOnlyUniqueAnswers attribute', async content => {
    matchings.forEach(matching => { matching._allowOnlyUniqueAnswers = false; });
    return true;
  });
  mutateContent('Matching - add item option _score', async (content) => {
    matchings.forEach((matching) => {
      matching._items.forEach(item => {
        return item._options.forEach((option) => _.set(option, '_score', 0));
      });
    });
    return true;
  });
  checkContent('Matching - check _hasItemScoring attribute', async content => {
    const isValid = matchings.every(({ _hasItemScoring }) => _hasItemScoring === false);
    if (!isValid) throw new Error('Matching - _hasItemScoring attribute invalid');
    return true;
  });
  checkContent('Matching - check _allowOnlyUniqueAnswers attribute', async content => {
    const isValid = matchings.every(({ _allowOnlyUniqueAnswers }) => _allowOnlyUniqueAnswers === false);
    if (!isValid) throw new Error('Matching - _allowOnlyUniqueAnswers attribute invalid');
    return true;
  });
  checkContent('Matching - check item option _score', async content => {
    const isValid = matchings.every(({ _items }) => {
      return _items.every(({ _options }) => {
        return _options.every((option) => option._score === 0);
      });
    });
    if (!isValid) throw new Error('Matching - item option _score attribute invalid');
    return true;
  });
  updatePlugin('Matching - update to v6.0.0', { name: 'adapt-contrib-matching', version: '6.0.0', framework: '>=5.18.0' });
});
