define([
    'core/js/adapt',
    './matchingView',
    './matchingModel'
], function(Adapt, MatchingView, MatchingModel) {

    // Force disable old iOS fixes in v2 frameworks
    // https://github.com/adaptlearning/adapt_framework/issues/2459
    if ($.a11y && $.a11y.options && $.a11y.options.isIOSFixesEnabled) {
        $.a11y.options.isIOSFixesEnabled = false;
    }

    return Adapt.register("matching", {
        view: MatchingView,
        model: MatchingModel
    });

});
