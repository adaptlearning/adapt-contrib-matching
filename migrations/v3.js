import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, testStopWhere, testSuccessWhere, getComponents } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v2.3.0 to v3.0.0', async () => {
  let matchings, course, courseMatchingGlobals;
  const originalAriaRegion = 'This question component requires you to select the matching answer from a drop down list below. When you have selected your answers select the submit button.';
  const newAriaRegion = 'Matching. Select from lists and then submit.';

  whereFromPlugin('Matching - from v2.3.0', { name: 'adapt-contrib-matching', version: '<3.0.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
    return matchings.length;
  });

  mutateContent('Matching - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._matching.ariaRegion')) _.set(course, '_globals._components._matching.ariaRegion', newAriaRegion);
    courseMatchingGlobals = course._globals._components._matching;
    return true;
  });

  mutateContent('Matching - add globals ariaRegion attribute', async content => {
    if (courseMatchingGlobals.ariaRegion !== originalAriaRegion) return true;
    courseMatchingGlobals.ariaRegion = newAriaRegion;
    return true;
  });

  checkContent('Matching - check globals object', async (content) => {
    if (!courseMatchingGlobals) throw new Error('Matching - course globals object missing');
    return true;
  });

  checkContent('Matching - check globals ariaRegion attribute', async (content) => {
    if (courseMatchingGlobals) {
      const isValid = courseMatchingGlobals.ariaRegion !== originalAriaRegion;
      if (!isValid) throw new Error('Matching - ariaRegion attribute missing');
    }
    return true;
  });

  updatePlugin('Matching - update to v3.0.0', { name: 'adapt-contrib-matching', version: '3.0.0', framework: '>=2.0.16' });

  testSuccessWhere('matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course' }
    ]
  });

  testSuccessWhere('matching component with empty course._globals', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course', _globals: { _components: { _matching: {} } } }
    ]
  });

  testSuccessWhere('matching component with default course._globals', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course', _globals: { _components: { _matching: { ariaRegion: originalAriaRegion } } } }
    ]
  });

  testSuccessWhere('matching component with custom course._globals', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }],
    content: [
      { _id: 'c-100', _component: 'matching' },
      { _id: 'c-105', _component: 'matching' },
      { _type: 'course', _globals: { _components: { _matching: { ariaRegion: 'custom ariaRegion' } } } }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '2.2.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '3.0.0' }]
  });
});
