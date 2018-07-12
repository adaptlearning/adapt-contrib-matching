define([
    'core/js/models/questionModel'
], function(QuestionModel) {
    
    var MatchingModel = QuestionModel.extend({

    	init: function() {
            QuestionModel.prototype.init.call(this);

            this.setupQuestionItemIndexes();
        },

        setupQuestionItemIndexes: function() {

            _.each(this.get('_items'), function(item, index) {
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

        setupRandomisation: function() {
            if (!this.get('_isRandom') || !this.get('_isEnabled')) return;

            _.each(this.get('_items'), function(item) {
                item._options = _.shuffle(item._options);
            });
        },

        restoreUserAnswers: function() {
            if (!this.get('_isSubmitted')) return;

            var userAnswer = this.get('_userAnswer');

            _.each(this.get('_items'), function(item, index) {
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
            this.setupFeedback();
        },

        canSubmit: function() {
        	// can submit if every item has a selection
            var canSubmit = _.every(this.get('_items'), function(item) {
            	return _.findWhere(item._options, {'_isSelected':true}) !== undefined;
            });

            return canSubmit;
        },

        setOptionSelected: function(itemIndex, optionIndex, isSelected) {
        	var item = this.get('_items')[itemIndex];
        	var option = item._options[optionIndex];

        	option._isSelected = isSelected;
        	item._selected = option;
        },

        storeUserAnswer: function() {

            var userAnswer = new Array(this.get('_items').length);
            var tempUserAnswer = new Array(this.get('_items').length);

            _.each(this.get('_items'), function(item, index) {

                /*var $selectedOption = this.$('.matching-select option:selected').eq(index);
                var optionIndex = $selectedOption.index() - 1;

                item._options[optionIndex]._isSelected = true;
                item._selected = item._options[optionIndex];*/

                var optionIndex = _.findIndex(item._options, function(o) {return o._isSelected});

                tempUserAnswer[item._index] = optionIndex;
                userAnswer[item._index] = item._options[optionIndex]._index;
            }, this);

            this.set({
                '_userAnswer': userAnswer,
                '_tempUserAnswer': tempUserAnswer
            });
        },

        isCorrect: function() {
            var numberOfCorrectAnswers = 0;

            _.each(this.get('_items'), function(item, index) {

                if (item._selected && item._selected._isCorrect) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                    this.set({
                        '_numberOfCorrectAnswers': numberOfCorrectAnswers,
                        '_isAtLeastOneCorrectSelection': true
                    });
                } else {
                    item._isCorrect = false;
                }

            }, this);

            this.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

            if (numberOfCorrectAnswers === this.get('_items').length) {
                return true;
            }

            return false;
        },

        setScore: function() {
            var questionWeight = this.get('_questionWeight');

            if (this.get('_isCorrect')) {
                this.set('_score', questionWeight);
                return;
            }

            var numberOfCorrectAnswers = this.get('_numberOfCorrectAnswers');
            var itemLength = this.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.set('_score', score);
        },

        isPartlyCorrect: function() {
            return this.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.set('_userAnswer', []);
        },

        /**
        * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
        * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
        * depending on which SCORM version is being used.
        */
        getResponse: function() {
            var responses = [];

            _.each(this.get('_userAnswer'), function(userAnswer, index) {
                responses.push((index + 1) + "." + (userAnswer + 1));// convert from 0-based to 1-based counting
            });

            return responses.join('#');
        },

        /**
        * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        * @return {string}
        */
        getResponseType: function() {
            return "matching";
        }
    });

    return MatchingModel;
});