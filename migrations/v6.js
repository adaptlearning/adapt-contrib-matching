import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, testStopWhere, testSuccessWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Matching - v5.0.0 to v6.0.0', async () => {
  let matchings;

  whereFromPlugin('Matching - from v5.0.0', { name: 'adapt-contrib-matching', version: '<6.0.0' });

  whereContent('Matching - where matching', async content => {
    matchings = getComponents('matching');
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

  testSuccessWhere('non/configured matching component with empty course', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '5.0.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'matching',
        _items: [
          {
            text: 'Pick option two',
            _options: [
              {
                text: 'Option one',
                _isCorrect: false
              },
              {
                text: 'Option two (correct)',
                _isCorrect: true
              },
              {
                text: 'Option three',
                _isCorrect: false
              }
            ]
          }
        ]
      },
      {
        _id: 'c-105',
        _component: 'matching',
        _items: [
          {
            text: 'Pick option two',
            _options: [
              {
                text: 'Option one',
                _isCorrect: false,
                _score: 0
              },
              {
                text: 'Option two (correct)',
                _isCorrect: true,
                _score: 1
              },
              {
                text: 'Option three',
                _isCorrect: false,
                _score: 0
              }
            ]
          }
        ]
      },
      { _type: 'course' }
    ]
  });

  testStopWhere('no matching components', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '5.0.0' }],
    content: [
      { _component: 'other' },
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-contrib-matching', version: '6.0.0' }]
  });
});
