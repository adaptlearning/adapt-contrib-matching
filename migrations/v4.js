import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, getComponents, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v4.1.1 to v4.2.0', async () => {
  let matchings, course, courseMatchingGlobals;
  const ariaCorrectAnswer = 'The correct answer for {{{itemText}}} is {{{correctAnswer}}}';
  const ariaUserAnswer = 'The answer you chose for {{{itemText}}} was {{{userAnswer}}}';

  whereFromPlugin('Matching - from v4.1.1', { name: 'adapt-contrib-matching', version: '<4.2.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._matching')) _.set(course, '_globals._components._matching', {});
    courseMatchingGlobals = course._globals._components._matching;
    return true;
  });

  mutateContent('Matching - add globals ariaCorrectAnswer attribute', async content => {
    courseMatchingGlobals.ariaCorrectAnswer = ariaCorrectAnswer;
    return true;
  });

  mutateContent('Matching - add globals ariaUserAnswer attribute', async content => {
    courseMatchingGlobals.ariaUserAnswer = ariaUserAnswer;
    return true;
  });

  checkContent('Matching - check globals object', async (content) => {
    if (!courseMatchingGlobals) throw new Error('Matching - course globals object missing');
    return true;
  });

  checkContent('Matching - check globals ariaCorrectAnswer attribute', async (content) => {
    const isValid = courseMatchingGlobals.ariaCorrectAnswer === ariaCorrectAnswer;
    if (!isValid) throw new Error('Matching - ariaCorrectAnswer attribute invalid');
    return true;
  });

  checkContent('Matching - check globals ariaUserAnswer attribute', async (content) => {
    const isValid = courseMatchingGlobals.ariaUserAnswer === ariaUserAnswer;
    if (!isValid) throw new Error('Matching - ariaUserAnswer attribute invalid');
    return true;
  });

  updatePlugin('Matching - update to v4.2.0', { name: 'adapt-contrib-matching', version: '4.2.0', framework: '>=5.7.0' });

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
