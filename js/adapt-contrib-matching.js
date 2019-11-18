define([
  'core/js/adapt',
  './matchingView',
  './matchingModel'
], function(Adapt, MatchingView, MatchingModel) {

  return Adapt.register('matching', {
    view: MatchingView,
    model: MatchingModel
  });

});
