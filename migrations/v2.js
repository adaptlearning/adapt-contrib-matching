import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, testStopWhere, testSuccessWhere, getComponents } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v2.0.0 to v2.0.1', async () => {
  let matchings;

  whereFromPlugin('Matching - from v2.0.0', { name: 'adapt-contrib-matching', version: '>=2.0.0 <2.0.1' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _recordInteraction attribute', async content => {
    matchings.forEach(matching => { matching._recordInteraction = true; });
    return true;
  });

  checkContent('Matching - check _recordInteraction attribute', async content => {
    const isValid = matchings.every(({ _recordInteraction }) => _recordInteraction === true);
    if (!isValid) throw new Error('Matching - _recordInteraction attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v2.0.1', { name: 'adapt-contrib-matching', version: '2.0.1', framework: '^2.0.0' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.1' }]
  });
});

describe('Matching - v2.0.2 to v2.0.3', async () => {
  let matchings;

  whereFromPlugin('Matching - from v2.0.2', { name: 'adapt-contrib-matching', version: '<2.0.3' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _canShowModelAnswer attribute', async content => {
    matchings.forEach(matching => { matching._canShowModelAnswer = true; });
    return true;
  });

  checkContent('Matching - check _canShowModelAnswer attribute', async content => {
    const isValid = matchings.every(({ _canShowModelAnswer }) => _canShowModelAnswer === true);
    if (!isValid) throw new Error('Matching - _canShowModelAnswer attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v2.0.3', { name: 'adapt-contrib-matching', version: '2.0.3', framework: '^2.0.0' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.3' }]
  });
});

describe('Matching - v2.0.4 to v2.1.0', async () => {
  let matchings;

  whereFromPlugin('Matching - from v2.0.4', { name: 'adapt-contrib-matching', version: '<2.1.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _canShowMarking attribute', async content => {
    matchings.forEach(matching => { matching._canShowMarking = true; });
    return true;
  });

  checkContent('Matching - check _canShowMarking attribute', async content => {
    const isValid = matchings.every(({ _canShowMarking }) => _canShowMarking === true);
    if (!isValid) throw new Error('Matching - _canShowMarking attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v2.1.0', { name: 'adapt-contrib-matching', version: '2.1.0', framework: '^2.0.15' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.1.0' }]
  });
});

describe('Matching - v2.1.1 to v2.1.2', async () => {
  let matchings;

  whereFromPlugin('Matching - from v2.1.1', { name: 'adapt-contrib-matching', version: '<2.1.2' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _canShowFeedback attribute', async content => {
    matchings.forEach(matching => { matching._canShowFeedback = true; });
    return true;
  });

  checkContent('Matching - check _canShowFeedback attribute', async content => {
    const isValid = matchings.every(({ _canShowFeedback }) => _canShowFeedback === true);
    if (!isValid) throw new Error('Matching - _canShowFeedback attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v2.1.2', { name: 'adapt-contrib-matching', version: '2.1.2', framework: '^2.0.15' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.0.2' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.1.0' }]
  });
});

describe('Matching - v2.1.4 to v2.2.0', async () => {
  let matchings;

  whereFromPlugin('Matching - from v2.1.4', { name: 'adapt-contrib-matching', version: '<2.2.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _shouldResetAllAnswers attribute', async content => {
    matchings.forEach(matching => { matching._shouldResetAllAnswers = false; });
    return true;
  });

  mutateContent('Matching - add _feedback.title attribute', async content => {
    matchings.forEach(matching => {
      _.set(matching, '_feedback.title', '');
      console.log(matching);
    });
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

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.1.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.1.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }]
  });
});
