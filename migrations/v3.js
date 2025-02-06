import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin } from 'adapt-migrations';
import _ from 'lodash';

let matchings;

describe('Matching - v2.2.0 to v3.0.0', async () => {
  whereFromPlugin('Matching - from v2.2.0', { name: 'adapt-contrib-matching', version: '>=3.0.0' });
  whereContent('Matching - where matching', async content => {
    matchings = content.filter(({ _component }) => _component === 'matching');
    return matchings.length;
  });
  updatePlugin('Matching - update to v3.0.0', { name: 'adapt-contrib-matching', version: '>=3.0.0', framework: '>=2.0.16' });
});
