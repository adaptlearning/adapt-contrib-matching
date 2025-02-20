import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v2.0.0 to v2.0.1', async () => {
  let matchings;
  whereFromPlugin('Matching - from v2.0.0', { name: 'adapt-contrib-matching', version: '>=2.0.0 <2.0.1' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });

  updatePlugin('Matching - update to v2.0.1', { name: 'adapt-contrib-matching', version: '2.0.1', framework: '^2.0.0' });
});

describe('Matching - v2.0.2 to v2.0.3', async () => {
  let matchings;
  whereFromPlugin('Matching - from v2.0.2', { name: 'adapt-contrib-matching', version: '<2.0.3' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });

  updatePlugin('Matching - update to v2.0.3', { name: 'adapt-contrib-matching', version: '2.0.3', framework: '^2.0.0' });
});

describe('Matching - v2.0.4 to v2.1.0', async () => {
  let matchings;
  whereFromPlugin('Matching - from v2.0.4', { name: 'adapt-contrib-matching', version: '<2.1.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });

  updatePlugin('Matching - update to v2.1.0', { name: 'adapt-contrib-matching', version: '2.1.0', framework: '^2.0.15' });
});

describe('Matching - v2.1.1 to v2.1.2', async () => {
  let matchings;
  whereFromPlugin('Matching - from v2.1.1', { name: 'adapt-contrib-matching', version: '<2.1.2' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });

  updatePlugin('Matching - update to v2.1.2', { name: 'adapt-contrib-matching', version: '2.1.2', framework: '^2.0.15' });
});

describe('Matching - v2.1.4 to v2.2.0', async () => {
  let matchings;
  whereFromPlugin('Matching - from v2.1.4', { name: 'adapt-contrib-matching', version: '<2.2.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - add _shouldResetAllAnswers attribute', async content => {
    matchings.forEach(matching => { matching._shouldResetAllAnswers = false; });
    return true;
  });
  mutateContent('Matching - add _feedback.title attribute', async content => {
    matchings.forEach(({ _feedback }) => { _.set(_feedback, 'title', ''); });
    return true;
  });
  checkContent('Matching - check _shouldResetAllAnswers attribute', async content => {
    const isValid = matchings.every(({ _shouldResetAllAnswers }) => _shouldResetAllAnswers === false);
    if (!isValid) throw new Error('Matching - _shouldResetAllAnswers attribute invalid');
    return true;
  });
  checkContent('Matching - check _feedback.title attribute', async content => {
    const isValid = matchings.every(({ _feedback }) => _feedback.title === '');
    if (!isValid) throw new Error('Matching - _feedback.title attribute invalid');
    return true;
  });
  updatePlugin('Matching - update to v2.2.0', { name: 'adapt-contrib-matching', version: '2.2.0', framework: '>=2.0.15' });
});
