define([
    'core/js/adapt',
    'core/js/views/questionView',
    './dropdownAdapter'
], function(Adapt, QuestionView, dropdownAdapter) {

    var MatchingView = QuestionView.extend({

        disableQuestion: function() {
            this.$('select').prop('disabled', true).select2({
                templateResult: this.wrapInJQuery,
                templateSelection: this.wrapInJQuery
            });
        },

        setupSelect2: function() {
            this.enableQuestion();
            if (this.model.get('_isEnabled') !== true) {
                // select2 ignores disabled property applied to <select> in the template
                this.disableQuestion();
            }
            _.bindAll(this, 'onOptionSelected');
            this.$('select').on('select2:select', this.onOptionSelected);
        },

        enableQuestion: function() {
            this.$('select').prop('disabled', false).select2({
                placeholder: this.model.get('placeholder'),
                minimumResultsForSearch: Infinity, // hides the search box from the Select2 dropdown
                dir: Adapt.config.get('_defaultDirection'),
                dropdownAdapter: dropdownAdapter,
                templateResult: this.wrapInJQuery,
                templateSelection: this.wrapInJQuery
            });
        },

        wrapInJQuery: function(state) {
            return $('<span>').html(state.text);
        },

        resetQuestionOnRevisit: function() {
            this.resetQuestion();
        },

        setupQuestion: function() {
            this.listenToOnce(Adapt, 'preRemove', this.onPreRemove);

            this.model.setupRandomisation();
        },

        onPreRemove: function() {
            this.$('select').off('select2:select', this.onOptionSelected);
            this.$('select').select2('destroy');
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
            this.setupSelect2();
        },

        onCannotSubmit: function() {
            this.$('select').each(function addErrorClass(index, element) {
                if (element.selectedIndex > 0) return;

                var $element = $(element);
                var $container = $element.parents('.matching-select-container');
                $container.addClass('error');
                // ensure the error class gets removed when the user selects a valid option
                var evt = "select2:select.errorclear";
                var $select = $element.parent();
                $select.off(evt);// prevent multiple event bindings if the user repeatedly clicks submit without first making a selection
                $select.on(evt, function(e) {
                    if (e.params.data.element.index > 0) {
                        $container.removeClass('error');
                        $select.off(evt);
                    }
                });
            });
        },

        onOptionSelected: function(e) {
            var itemIndex = $(e.target).parents('.matching-item').index();
            var optionIndex = $(e.params.data.element).index() - 1;
            this.model.setOptionSelected(itemIndex, optionIndex, true);
        },

        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            this.model.get('_items').forEach(function(item, i) {

                var $item = this.$('.matching-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        resetQuestion: function() {

            this.$('.matching-item').removeClass('correct incorrect');

            this.model.set('_isAtLeastOneCorrectSelection', false);

            var placeholder = this.model.get('placeholder');
            var resetAll = this.model.get('_shouldResetAllAnswers');

            this.model.get('_items').forEach(function(item, index) {
                if (item._isCorrect && resetAll === false) return;

                this.selectValue(index, placeholder);

                item._options.forEach(function(option, index) {
                    option._isSelected = false;
                });

                item._selected = null;
            }, this);
        },

        showCorrectAnswer: function() {
            this.model.get('_items').forEach(function(item, index) {
                var correctOption = _.findWhere(item._options, { _isCorrect: true });
                this.selectValue(index, correctOption.text);
            }, this);
        },

        hideCorrectAnswer: function() {
            var answerArray = this.model.has('_tempUserAnswer') ?
                this.model.get('_tempUserAnswer') :
                this.model.get('_userAnswer');

            this.model.get('_items').forEach(function (item, index) {
                var key = answerArray[index];
                var value = item._options[key].text;
                this.selectValue(index, value);
            }, this);
        },

        /**
         * sets the selected item of a dropdown
         * @param {number} index The index (0-based) of the dropdown
         * @param {string} value The dropdown item you want to be selected
         * @example
         * // sets the third dropdown to "Hebrew"
         * this.selectValue(2, "Hebrew");
         */
        selectValue: function(i, value) {
            value = $.trim(value);// select2 strips leading/trailing spaces so we need to as well - fixes https://github.com/adaptlearning/adapt_framework/issues/1503
            this.$('select').eq(i).val(value).trigger('change');
        }
    });

    return MatchingView;
});