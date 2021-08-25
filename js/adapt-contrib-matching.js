import Adapt from 'core/js/adapt';
import MatchingView from './matchingView';
import MatchingModel from './matchingModel';

export default Adapt.register('matching', {
  view: MatchingView,
  model: MatchingModel
});
