define([
    'core/js/adapt',
    './matchingView',
    './matchingModel',
    './dropdownAdapter'
], function(Adapt, MatchingView, MatchingModel) {

    return Adapt.register("matching", {
        view: MatchingView,
        model: MatchingModel
    });
});