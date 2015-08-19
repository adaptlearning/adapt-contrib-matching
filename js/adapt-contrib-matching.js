define(function(require) {

    var QuestionView = require('coreViews/questionView');
    var Adapt = require('coreJS/adapt');
    
    var Matching = QuestionView.extend({

        events: {
            'change .matching-select': 'onChangeAnswer'
        },

        // Used by question to disable the question during submit and complete stages
        disableQuestion: function() {
            this.$('.matching-select').prop('disabled', true);
        },

        // Used by question to enable the question during interactions
        enableQuestion: function() {
            this.$('.matching-select').prop('disabled', false);
        },

        // Used by the question to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {
            this.resetQuestion();
        },

        setupQuestion: function() {
            this.setupItemIndexes();
            this.restoreUserAnswers();

            if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
                this.randomiseOptions();
            }
        },

        setupItemIndexes: function() {

            _.each(this.model.get("_items"), function(item, index) {
                if (item._index == undefined) {
                    item._index = index;
                    item._selected = false;
                }
                _.each(item._options, function(option, index) {
                    if (option._index == undefined) {
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

        randomiseOptions: function() {
            _.each(this.model.get('_items'), function(item) {
                item._options =  _.shuffle(item._options);
            });
        },

        // Blank method used just like postRender is for presentational components
        onQuestionRendered: function() {
            this.setReadyStatus();
        },

        onChangeAnswer: function( e ) {
            var jqoSelect = $( e.currentTarget ),
                intItem = jqoSelect.attr( 'data-itemindex' ),
                intOption = jqoSelect.children( ':selected' ).index()-1;

            _.each(this.model.get("_items"), function(item, index) {
                if( index == intItem ) {
                    _.each(item._options, function(option, index) {
                        if( index == intOption ) {
                            option._isSelected = true;
                            item._selected = option;
                        } else {
                            option._isSelected = false;
                        }
                    });
                }
            });
        },

        // Use to check if the user is allowed to submit the question
        // Maybe the user has to select an item?
        // Should return a boolean
        canSubmit: function() {

            var canSubmit = true;

            $('.matching-select option:selected',this.el).each(_.bind(function(index, element) {

                var $element = $(element);

                if ($element.index()==0) {
                    canSubmit = false;
                    $element.parent('.matching-select').addClass('error');
                }

            }, this));

            return canSubmit;

        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {},

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {

            var userAnswer = new Array(this.model.get('_items').length);

            _.each(this.model.get('_items'), function(item, index) {
                var $selectedOption = this.$('.matching-select option:selected').eq(index);
                var optionIndex = $selectedOption.index()-1;
                userAnswer[item._index] = optionIndex;
            }, this);
            
            this.model.set('_userAnswer', userAnswer);

        },

        // Should return a boolean based upon whether to question is correct or not
        isCorrect: function() {

            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_items'), function(item, index) {

                if (item._selected && item._selected._isCorrect) {
                    numberOfCorrectAnswers ++;
                    item._isCorrect = true;
                    this.model.set('_isAtLeastOneCorrectSelection', true);
                } else {
                    item._isCorrect = false;
                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

            return ( numberOfCorrectAnswers === this.model.get('_items').length );

        },

        // Used to set the score based upon the _questionWeight
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

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function() {
            this.model.set({_userAnswer: []});
        },

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        // This is triggered when the reset button is clicked so it shouldn't
        // be a full reset
        resetQuestion: function() {
            this.$('.matching-select option').prop('selected', false);
            this.$(".matching-item").removeClass("correct").removeClass("incorrect");
            this.model.set('_isAtLeastOneCorrectSelection', false);
            _.each(this.$('.matching-select'), function(item) {
                this.selectOption($(item), 0);
            }, this);
            _.each(this.model.get("_items"), function(item, index) {
                _.each(item._options, function(option, index) {
                    option._isSelected = false;
                });
            });
        },

        // Used by the question to display the correct answer to the user
        showCorrectAnswer: function() {

            _.each(this.model.get('_items'), function(item, index) {

                var correctOptionIndex;

                _.each(item._options, function(option, optionIndex) {
                    if (option._isCorrect) {
                        correctOptionIndex = optionIndex + 1;
                    }
                }, this);

                var $parent = this.$('.matching-select').eq(index);
                
                this.selectOption($parent, correctOptionIndex);

            }, this);

        },

        // Used by the question to display the users answer and
        // hide the correct answer
        // Should use the values stored in storeUserAnswer
        hideCorrectAnswer: function() {
            for(var i = 0, count = this.model.get('_items').length; i < count; i++) {
                var $parent = this.$('.matching-select').eq(i);
                var index = this.model.get('_userAnswer')[i]+1;
                $('option', $parent).eq(index).prop('selected', true);
                this.selectOption($parent, index);
            }
        },

        selectOption: function($parent, optionIndex) {
            $("option", $parent).eq(optionIndex).prop('selected', true);
        }

    });
    
    Adapt.register("matching", Matching);

    return Matching;
    
});