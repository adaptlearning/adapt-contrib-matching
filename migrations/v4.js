import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v3.0.0 to v4.2.0', async () => {
  let matchings, course, courseMatchingGlobals;
  whereFromPlugin('Matching - from v3.0.0', { name: 'adapt-contrib-matching', version: '<4.2.0' });
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
  mutateContent('Matching - add globals ariaCorrectAnswer attribute', async content => {
    course = content.find(({ _type }) => _type === 'course');
    courseMatchingGlobals = course._globals._components._matching;
    courseMatchingGlobals.ariaCorrectAnswer = 'The correct answer for {{{itemText}}} is {{{correctAnswer}}}';
    return true;
  });
  mutateContent('Matching - add globals ariaUserAnswer attribute', async content => {
    courseMatchingGlobals.ariaUserAnswer = 'The answer you chose for {{{itemText}}} was {{{userAnswer}}}';
    return true;
  });
  checkContent('Matching - check globals object', async (content) => {
    if (!courseMatchingGlobals) throw new Error('Matching - course globals object missing');
    return true;
  });
  checkContent('Matching - check globals ariaCorrectAnswer attribute', async (content) => {
    const isValid = courseMatchingGlobals.ariaCorrectAnswer === 'The correct answer for {{{itemText}}} is {{{correctAnswer}}}';
    if (!isValid) throw new Error('Matching - ariaCorrectAnswer attribute invalid');
    return true;
  });
  checkContent('Matching - check globals ariaUserAnswer attribute', async (content) => {
    const isValid = courseMatchingGlobals.ariaUserAnswer === 'The answer you chose for {{{itemText}}} was {{{userAnswer}}}';
    if (!isValid) throw new Error('Matching - ariaUserAnswer attribute invalid');
    return true;
  });
  updatePlugin('Matching - update to v4.2.0', { name: 'adapt-contrib-matching', version: '4.2.0', framework: '>=5.7.0' });
});
