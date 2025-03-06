import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, testStopWhere, testSuccessWhere, getComponents } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v7.1.2 to v7.2.0', async () => {
  let matchings;
  const originalInstruction = '';
  const newInstruction = 'Choose an option from each dropdown list and select Submit.';

  whereFromPlugin('Matching - from v7.1.2', { name: 'adapt-contrib-matching', version: '<7.2.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - update instruction attribute', async content => {
    matchings.forEach(matching => {
      if (!_.has(matching, 'instruction')) _.set(matching, 'instruction', newInstruction);
      if (matching.instruction !== originalInstruction) return;
      matching.instruction = newInstruction;
    });
    return true;
  });

  checkContent('Matching - check instruction attribute', async content => {
    const isValid = matchings.every(({ instruction }) => instruction !== originalInstruction);
    if (!isValid) throw new Error('Matching - instruction attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v7.2.0', { name: 'adapt-contrib-matching', version: '7.2.0', framework: '>=5.19.1' });

  testSuccessWhere('non/configured matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.1.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching', instruction: '' },
      { _id: 'c-110', _component: 'matching', instruction: 'Custom instruction' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.1.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.0' }]
  });
});

describe('Matching - v7.2.0 to v7.2.1', async () => {
  let matchings;

  whereFromPlugin('Matching - from v7.2.0', { name: 'adapt-contrib-matching', version: '<7.2.1' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
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

  testSuccessWhere('non/configured matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.1' }]
  });
});

describe('Matching - v7.2.7 to v7.3.0', async () => {
  let matchings;

  whereFromPlugin('Matching - from v7.2.7', { name: 'adapt-contrib-matching', version: '<7.3.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _isRandomQuestionOrder attribute', async content => {
    matchings.forEach(matching => (matching._isRandomQuestionOrder = false));
    return true;
  });

  checkContent('Matching - check _isRandomQuestionOrder attribute', async content => {
    const isValid = matchings.every(matching => matching._isRandomQuestionOrder === false);
    if (!isValid) throw new Error('Matching - _isRandomQuestionOrder attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v7.3.0', { name: 'adapt-contrib-matching', version: '7.3.0', framework: '>=5.19.1' });

  testSuccessWhere('non/configured matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.2.1' }]
  });
});

describe('Matching - v7.4.0 to v7.4.1', async () => {
  let matchings;

  whereFromPlugin('Matching - from v7.4.0', { name: 'adapt-contrib-matching', version: '<7.4.1' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _hasItemScoring attribute if missing', async content => {
    matchings.forEach(matching => {
      if (!_.has(matching, '_hasItemScoringmatching')) matching._hasItemScoring = false;
    });
    return true;
  });

  mutateContent('Matching - add _allowOnlyUniqueAnswers attribute if missing', async content => {
    matchings.forEach(matching => {
      if (!_.has(matching, '_allowOnlyUniqueAnswers')) matching._allowOnlyUniqueAnswers = false;
    });
    return true;
  });

  checkContent('Matching - check _hasItemScoring attribute', async content => {
    const isValid = matchings.every(matching => matching._hasItemScoring === false);
    if (!isValid) throw new Error('Matching - _hasItemScoring attribute invalid');
    return true;
  });

  checkContent('Matching - check _allowOnlyUniqueAnswers attribute', async content => {
    const isValid = matchings.every(matching => matching._allowOnlyUniqueAnswers === false);
    if (!isValid) throw new Error('Matching - _allowOnlyUniqueAnswers attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v7.4.1', { name: 'adapt-contrib-matching', version: '7.4.1', framework: '>=5.19.1' });

  testSuccessWhere('non/configured matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.4.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.4.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '7.4.1' }]
  });
});

describe('Matching - v7.4.6 to v7.5.0', async () => {
  let matchings, course, courseMatchingGlobals;
  const correctAnswerPrefix = 'The correct answer is';
  const correctAnswersPrefix = 'The correct answers are';

  whereFromPlugin('Matching - from v7.4.6', { name: 'adapt-contrib-matching', version: '<7.5.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add _canShowCorrectness attribute', async content => {
    matchings.forEach(matching => (matching._canShowCorrectness = false));
    return true;
  });

  mutateContent('Matching - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._matching')) _.set(course, '_globals._components._matching', {});
    courseMatchingGlobals = course._globals._components._matching;
    return true;
  });

  mutateContent('Matching - add globals correctAnswerPrefix attribute', async content => {
    courseMatchingGlobals.correctAnswerPrefix = correctAnswerPrefix;
    return true;
  });

  mutateContent('Matching - add globals correctAnswersPrefix attribute', async content => {
    courseMatchingGlobals.correctAnswersPrefix = correctAnswersPrefix;
    return true;
  });

  checkContent('Matching - check globals object', async (content) => {
    if (!courseMatchingGlobals) throw new Error('Matching - course globals object missing');
    return true;
  });

  checkContent('Matching - check _canShowCorrectness attribute', async content => {
    const isValid = matchings.every(matching => matching._canShowCorrectness === false);
    if (!isValid) throw new Error('Matching - _canShowCorrectness attribute invalid');
    return true;
  });

  checkContent('Matching - check globals correctAnswerPrefix attribute', async (content) => {
    if (courseMatchingGlobals) {
      const isValid = courseMatchingGlobals.correctAnswerPrefix === correctAnswerPrefix;
      if (!isValid) throw new Error('Matching - correctAnswerPrefix attribute missing');
    }
    return true;
  });

  checkContent('Matching - check globals correctAnswersPrefix attribute', async (content) => {
    if (courseMatchingGlobals) {
      const isValid = courseMatchingGlobals.correctAnswersPrefix === correctAnswersPrefix;
      if (!isValid) throw new Error('Matching - correctAnswersPrefix attribute missing');
    }
    return true;
  });

  updatePlugin('Matching - update to v7.5.0', { name: 'adapt-contrib-matching', version: '7.5.0', framework: '>=5.19.1' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '4.1.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('matching component with empty course._globals', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '4.1.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course', _globals: { _components: { _matching: {} } } }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '4.1.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '4.2.0' }]
  });
});
