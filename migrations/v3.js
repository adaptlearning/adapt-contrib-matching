import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v2.2.0 to v3.0.0', async () => {
  let matchings, course, courseMatchingGlobals;
  const originalAriaRegion = 'This question component requires you to select the matching answer from a drop down list below. When you have selected your answers select the submit button.';
  whereFromPlugin('Matching - from v2.2.0', { name: 'adapt-contrib-matching', version: '<3.0.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - add globals if missing', async (content) => {
    course = getCourse();
    if (!_.has(course, '_globals._components._matching')) _.set(course, '_globals._components._matching', {});
    courseMatchingGlobals = course._globals._components._matching;
    return true;
  });
  mutateContent('Matching - add globals ariaRegion attribute', async content => {
    if (courseMatchingGlobals.ariaRegion === originalAriaRegion) {
      courseMatchingGlobals.ariaRegion = 'Matching. Select from lists and then submit.';
    }
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
});
