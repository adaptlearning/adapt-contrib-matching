import Adapt from 'core/js/adapt';
import MatchingView from './MatchingView';
import MatchingModel from './MatchingModel';

export default Adapt.register('matching', {
  view: MatchingView,
  model: MatchingModel
});
