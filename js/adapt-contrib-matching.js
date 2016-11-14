define([
    'core/js/adapt',
    'core/js/views/questionView',
    'libraries/select2'
],function(Adapt, QuestionView) {

    var Matching = QuestionView.extend({

        // Used by questionView to disable the question during submit and complete stages
        disableQuestion: function() {
            this.$('select').prop("disabled", true).select2();
        },

        setupSelect2: function() {
            this.enableQuestion();
            if (this.model.get('_isEnabled') !== true) {
                // select2 ignores disabled property applied to <select> in the template 
                this.disableQuestion();
            }
        },

        // Used by questionView to enable the question during interactions
        enableQuestion: function() {
            this.$('select').prop("disabled", false).select2({
                minimumResultsForSearch: Infinity,
                dir: Adapt.config.get('_defaultDirection')
            });
        },

        // Used by questionView to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {
            this.resetQuestion();
        },

        setupQuestion: function() {
            this.listenToOnce(Adapt, 'preRemove', this.onPreRemove);

            this.setupItemIndexes();
            
            this.restoreUserAnswers();

            this.setupRandomisation();
        },

        onPreRemove: function() {
            this.$('select').select2('destroy');
        },

        setupItemIndexes: function() {

            _.each(this.model.get("_items"), function(item, index) {
                if (item._index === undefined) {
                    item._index = index;
                    item._selected = false;
                }
                _.each(item._options, function(option, index) {
                    if (option._index === undefined) {
                        option._index = index;
                        option._isSelected = false;
                    }
                });
            });

        },

        restoreUserAnswers: function() {
            if (!this.model.get("_isSubmitted")) return;

            var userAnswer = this.model.get("_userAnswer");

            _.each(this.model.get("_items"), function(item, index) {
                _.each(item._options, function(option, index) {
                    if (option._index == userAnswer[item._index]) {
                        option._isSelected = true;
                        item._selected = option;
                    }
                });
            });

            this.setQuestionAsSubmitted();
            this.markQuestion();
            this.setScore();
            this.showMarking();
            this.setupFeedback();
        },

        setupRandomisation: function() {
            if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
                _.each(this.model.get('_items'), function(item) {
                    item._options = _.shuffle(item._options);
                });
            }
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
            this.setupSelect2();
        },

        canSubmit: function() {

            var canSubmit = true;

            $('.matching-select option:selected', this.el).each(_.bind(function(index, element) {

                var $element = $(element);

                if ($element.index() === 0) {
                    canSubmit = false;
                    $element.parent('.matching-select').addClass('error');
                }
            }, this));

            return canSubmit;
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {
            //TODO have this highlight all the drop-downs the user has yet to select.
            //Currently it just highlights the first one, even if that one has been selected
        },

        storeUserAnswer: function() {

            var userAnswer = new Array(this.model.get('_items').length);
            var tempUserAnswer = new Array(this.model.get('_items').length);

            _.each(this.model.get('_items'), function(item, index) {

                var $selectedOption = this.$('.matching-select option:selected').eq(index);
                var optionIndex = $selectedOption.index() - 1;

                item._options[optionIndex]._isSelected = true;
                item._selected = item._options[optionIndex];

                tempUserAnswer[item._index] = optionIndex;
                userAnswer[item._index] = item._options[optionIndex]._index;
            }, this);

            this.model.set('_userAnswer', userAnswer);
            this.model.set('_tempUserAnswer', tempUserAnswer);
        },

        isCorrect: function() {

            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_items'), function(item, index) {

                if (item._selected && item._selected._isCorrect) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                    this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
                    this.model.set('_isAtLeastOneCorrectSelection', true);
                } else {
                    item._isCorrect = false;
                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

            if (numberOfCorrectAnswers === this.model.get('_items').length) {
                return true;
            } else {
                return false;
            }

        },

        setScore: function() {
            var questionWeight = this.model.get("_questionWeight");

            if (this.model.get('_isCorrect')) {
                this.model.set('_score', questionWeight);
                return;
            }

            var numberOfCorrectAnswers = this.model.get('_numberOfCorrectAnswers');
            var itemLength = this.model.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.model.set('_score', score);
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            _.each(this.model.get('_items'), function(item, i) {

                var $item = this.$('.matching-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        // Used by the question to determine if the question is incorrect or partly correct
        // Should return a boolean
        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.model.set({_userAnswer: []});
        },

        // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {
            this.$('.matching-select option').prop('selected', false);
            
            this.$(".matching-item").removeClass("correct").removeClass("incorrect");
            
            this.model.set('_isAtLeastOneCorrectSelection', false);
            
            var placeholder = this.model.get('placeholder');
            
            _.each(this.model.get("_items"), function(item, index) {
                this.selectValue(index, placeholder);
                _.each(item._options, function(option, index) {
                    option._isSelected = false;
                });
            }, this);
        },

        showCorrectAnswer: function() {
            var items = this.model.get('_items');

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var correctOption = _.findWhere(item._options, {_isCorrect: true});
                this.selectValue(i, correctOption.text);
            }
        },

        hideCorrectAnswer: function() {
            var items = this.model.get('_items');
            for (var i = 0, count = items.length; i < count; i++) {
                var index = this.model.has('_tempUserAnswer')
                  ? this.model.get('_tempUserAnswer')[i]
                  : this.model.get('_userAnswer')[i];

                var item = items[i];
                var value = item._options[index].text;

                this.selectValue(i, value);
            }
        },

        selectValue: function(i, value) {
            this.$('select').eq(i).val(value).trigger('change');
        },

        /**
        * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * Returns the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1, option 3 in drop-down 2
        * and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor, depending on which SCORM version is being used.
        */
        getResponse: function() {

            var userAnswer = this.model.get('_userAnswer');
            var responses = [];

            for(var i = 0, count = userAnswer.length; i < count; i++) {
                responses.push((i + 1) + "." + (userAnswer[i] + 1));// convert from 0-based to 1-based counting
            }
            
            return responses.join('#');
        },

        /**
        * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        */
        getResponseType: function() {
            return "matching";
        }

    });

    Adapt.register("matching", Matching);

    return Matching;

});
