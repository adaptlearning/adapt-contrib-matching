import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';

describe('Matching - v2.2.0 to v3.0.0', async () => {
  let matchings, course, courseMatchingGlobals;
  const originalAriaRegion = 'This question component requires you to select the matching answer from a drop down list below. When you have selected your answers select the submit button.';
  whereFromPlugin('Matching - from v2.2.0', { name: 'adapt-contrib-matching', version: '>=3.0.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  mutateContent('Matching - add globals ariaRegion attribute', async content => {
    course = content.find(({ _type }) => _type === 'course');
    courseMatchingGlobals = course._globals._components._matching;
    if (courseMatchingGlobals.ariaRegion === originalAriaRegion) courseMatchingGlobals.ariaRegion = 'Matching. Select from lists and then submit.';
    return true;
  });
  checkContent('Matching - check globals ariaRegion attribute', async (content) => {
    if (courseMatchingGlobals) {
      const isValid = courseMatchingGlobals.ariaRegion !== originalAriaRegion;
      if (!isValid) throw new Error('Matching - ariaRegion attribute missing');
    }
    return true;
  });
  updatePlugin('Matching - update to v3.0.0', { name: 'adapt-contrib-matching', version: '>=3.0.0', framework: '>=2.0.16' });
});
