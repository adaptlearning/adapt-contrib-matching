define([
    'core/js/adapt',
    'core/js/views/questionView',
    'libraries/select2'
], function(Adapt, QuestionView) {

    /*
     * issue/1543: fix from https://github.com/select2/select2/issues/4063
     */
    var dropdownAdapter;
    jQuery.fn.select2.amd.require([
        "select2/utils",
        "select2/dropdown",
        "select2/dropdown/attachContainer",
        "select2/dropdown/closeOnSelect"
    ], function(Utils, DropdownAdapter, AttachContainer, CloseOnSelect) {

        /*
         * issues/1889: fix from https://github.com/adaptlearning/adapt_framework/issues/1889
         * code added to make dropdown sit above body bottom where appropriate
         */
        AttachContainer.prototype.bind = function(decorated, container, $container) {

            var self = this;
            decorated.call(this, $container, $container);

            container.on('opening', function () {
                // hide so that popup doesn't jump when repositioned
                self.$dropdown.css("visibility", "hidden");
            });

            container.on('open', function () {
                // add dropdown at this point so that the browser focus works correctly
                var $dropdownContainer = $container.find('.dropdown-wrapper');
                $dropdownContainer.append(self.$dropdown);

                // defer to allow dom to settle before repositioning
                setTimeout(function() {
                    self.position(self.$dropdown, $container);
                    self.$dropdown.css("visibility", "");
                }, 0);

            });

        };

        AttachContainer.prototype.position = function(decorated, $dropdown, $container) {

            var $window = $(window);

            var viewport = {
                top: $window.scrollTop(),
                bottom: $window.scrollTop() + $window.height()
            };

            var container = $container.offset();
            container.height = $container.outerHeight(false);
            container.bottom = container.top + container.height;

            var dropdown = {
                height: $dropdown.outerHeight(false)
            };

            var enoughRoomBelow = !dropdown.height || viewport.bottom > (container.bottom + dropdown.height);

            var oldDirection = $dropdown.hasClass('select2-dropdown--above') ? "above" : $dropdown.hasClass('select2-dropdown--below') ? "below" : "none";
            var newDirection = !enoughRoomBelow ? "above" : "below";

            if (newDirection === oldDirection) return;

            $dropdown
                .removeClass('select2-dropdown--below select2-dropdown--above')
                .addClass('select2-dropdown--' + newDirection);
            $container
                .removeClass('select2-container--below select2-container--above')
                .addClass('select2-container--' + newDirection);

            switch (newDirection) {
                case "below":
                    $dropdown.css("bottom", "");
                    break;
                case "above":
                    $dropdown.css("bottom", container.height);
                    break;
            }

        };


        // override default AttachBody
        dropdownAdapter = Utils.Decorate(
            Utils.Decorate(
                DropdownAdapter,
                AttachContainer
            ),
            CloseOnSelect
        );

    });

    var Matching = QuestionView.extend({

        disableQuestion: function() {
            this.$('select').prop('disabled', true).select2();
        },

        setupSelect2: function() {
            this.enableQuestion();
            if (this.model.get('_isEnabled') !== true) {
                // select2 ignores disabled property applied to <select> in the template
                this.disableQuestion();
            }
        },

        enableQuestion: function() {
            this.$('select').prop('disabled', false).select2({
                placeholder: this.model.get('placeholder'),
                minimumResultsForSearch: Infinity, // hides the search box from the Select2 dropdown
                dir: Adapt.config.get('_defaultDirection'),
                dropdownAdapter: dropdownAdapter
            });
        },

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

        /**
         * Assigns indexes to all the options so that they can safely be randomised
         */
        setupItemIndexes: function() {

            _.each(this.model.get('_items'), function(item, index) {
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
            if (!this.model.get('_isSubmitted')) return;

            var userAnswer = this.model.get('_userAnswer');

            _.each(this.model.get('_items'), function(item, index) {
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
            if (!this.model.get('_isRandom') || !this.model.get('_isEnabled')) return;

            _.each(this.model.get('_items'), function(item) {
                item._options = _.shuffle(item._options);
            });
        },

        onQuestionRendered: function() {
            this.setReadyStatus();
            this.setupSelect2();
        },

        /**
         * Checks whether the user has selected a value in all the dropdowns or not
         * @return {boolean}
         */
        canSubmit: function() {
            var canSubmit = true;

            this.$('select').each(function isOptionSelected(index, element) {
                if (element.selectedIndex < 1) {// the placeholder has an index of 0 in Firefox and -1 in other browsers
                    canSubmit = false;
                    return false;
                }
            });

            return canSubmit;
        },

        onCannotSubmit: function() {
            this.$('select').each(function addErrorClass(index, element) {
                if (element.selectedIndex < 1) {
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
                }
            });
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

            this.model.set({
                '_userAnswer': userAnswer,
                '_tempUserAnswer': tempUserAnswer
            });
        },

        isCorrect: function() {
            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_items'), function(item, index) {

                if (item._selected && item._selected._isCorrect) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                    this.model.set({
                        '_numberOfCorrectAnswers': numberOfCorrectAnswers,
                        '_isAtLeastOneCorrectSelection': true
                    });
                } else {
                    item._isCorrect = false;
                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

            if (numberOfCorrectAnswers === this.model.get('_items').length) {
                return true;
            }

            return false;
        },

        setScore: function() {
            var questionWeight = this.model.get('_questionWeight');

            if (this.model.get('_isCorrect')) {
                this.model.set('_score', questionWeight);
                return;
            }

            var numberOfCorrectAnswers = this.model.get('_numberOfCorrectAnswers');
            var itemLength = this.model.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.model.set('_score', score);
        },

        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            _.each(this.model.get('_items'), function(item, i) {

                var $item = this.$('.matching-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.model.set('_userAnswer', []);
        },

        resetQuestion: function() {

            this.$('.matching-item').removeClass('correct incorrect');

            this.model.set('_isAtLeastOneCorrectSelection', false);

            var placeholder = this.model.get('placeholder');
            var resetAll = this.model.get('_shouldResetAllAnswers');

            _.each(this.model.get('_items'), function(item, index) {
                if (item._isCorrect && resetAll === false) return;

                this.selectValue(index, placeholder);

                _.each(item._options, function(option, index) {
                    option._isSelected = false;
                });
            }, this);
        },

        showCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                var correctOption = _.findWhere(item._options, { _isCorrect: true });
                this.selectValue(index, correctOption.text);
            }, this);
        },

        hideCorrectAnswer: function() {
            var answerArray = this.model.has('_tempUserAnswer') ?
                this.model.get('_tempUserAnswer') :
                this.model.get('_userAnswer');

            _.each(this.model.get('_items'), function (item, index) {
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
        },

        /**
        * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
        * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
        * depending on which SCORM version is being used.
        */
        getResponse: function() {
            var responses = [];

            _.each(this.model.get('_userAnswer'), function(userAnswer, index) {
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

    return Adapt.register("matching", Matching);

});