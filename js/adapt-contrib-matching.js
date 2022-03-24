import components from 'core/js/components';
import MatchingView from './MatchingView';
import MatchingModel from './MatchingModel';

export default components.register('matching', {
  view: MatchingView,
  model: MatchingModel
});
