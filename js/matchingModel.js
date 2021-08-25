define([
  'core/js/adapt',
  'core/js/models/questionModel'
], function(Adapt, QuestionModel) {

  class MatchingModel extends QuestionModel {

    init() {
      QuestionModel.prototype.init.call(this);

      this.setupQuestionItemIndexes();
    }

    setupQuestionItemIndexes() {
      this.get('_items').forEach(function(item, index) {
        if (item._index === undefined) {
          item._index = index;
          item._selected = false;
        }
        item._options.forEach(function(option, index) {
          if (option._index === undefined) {
            option._index = index;
            option._isSelected = false;
          }
        });
      });
    }

    setupRandomisation() {
      if (!this.get('_isRandom') || !this.get('_isEnabled')) return;

      this.get('_items').forEach(function(item) {
        item._options = _.shuffle(item._options);
      });
    }

    restoreUserAnswers() {
      if (!this.get('_isSubmitted')) return;

      const userAnswer = this.get('_userAnswer');

      this.get('_items').forEach(function(item, index) {
        item._options.forEach(function(option, index) {
          if (option._index === userAnswer[item._index]) {
            option._isSelected = true;
            item._selected = option;
          }
        });
      });

      this.setQuestionAsSubmitted();
      this.checkCanSubmit();
      this.markQuestion();
      this.setScore();
      this.setupFeedback();
    }

    canSubmit() {
      // can submit if every item has a selection
      const canSubmit = _.every(this.get('_items'), function(item) {
        return _.findWhere(item._options, { _isSelected: true }) !== undefined;
      });

      return canSubmit;
    }

    setOptionSelected(itemIndex, optionIndex, isSelected) {
      const item = this.get('_items')[itemIndex];
      if (isNaN(optionIndex)) {
        item._options.forEach(option => (option._isSelected = false));
        item._selected = null;
        return this.checkCanSubmit();
      }
      const option = _.findWhere(item._options, { _index: optionIndex });
      option._isSelected = isSelected;
      item._selected = option;
      this.checkCanSubmit();
    }

    storeUserAnswer() {

      const userAnswer = new Array(this.get('_items').length);
      const tempUserAnswer = new Array(this.get('_items').length);

      this.get('_items').forEach(function(item, index) {
        const optionIndex = _.findIndex(item._options, function(o) { return o._isSelected; });

        tempUserAnswer[item._index] = optionIndex;
        userAnswer[item._index] = item._options[optionIndex]._index;
      }, this);

      this.set({
        _userAnswer: userAnswer,
        _tempUserAnswer: tempUserAnswer
      });
    }

    isCorrect() {
      let numberOfCorrectAnswers = 0;

      this.get('_items').forEach(function(item, index) {

        const isCorrect = (item._selected && item._selected._isCorrect);

        if (!isCorrect) {
          item._isCorrect = false;
          return;
        }

        numberOfCorrectAnswers++;
        item._isCorrect = true;
        this.set({
          _numberOfCorrectAnswers: numberOfCorrectAnswers,
          _isAtLeastOneCorrectSelection: true
        });

      }, this);

      this.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);

      if (numberOfCorrectAnswers === this.get('_items').length) {
        return true;
      }

      return false;
    }

    setScore() {
      const questionWeight = this.get('_questionWeight');

      if (this.get('_isCorrect')) {
        this.set('_score', questionWeight);
        return;
      }

      const numberOfCorrectAnswers = this.get('_numberOfCorrectAnswers');
      const itemLength = this.get('_items').length;

      const score = questionWeight * numberOfCorrectAnswers / itemLength;

      this.set('_score', score);
    }

    isPartlyCorrect() {
      return this.get('_isAtLeastOneCorrectSelection');
    }

    resetUserAnswer() {
      this.set('_userAnswer', []);
    }

    /**
    * Used by tracking extensions to return an object containing the component's specific interactions.
    */
    getInteractionObject() {
      const interactions = {
        correctResponsesPattern: null,
        source: null,
        target: null
      };
      const items = this.get('_items');
      // This contains an array with a single string value, matching the source 'id' with the correct
      // matching target 'id' value. An example is as follows:
      // [ "1[.]1_2[,]2[.]2_3" ]
      interactions.correctResponsesPattern = [
        items.map(function(item, questionIndex) {
          // Offset the item index and use it as a group identifier.
          questionIndex = questionIndex + 1;
          return [
            questionIndex,
            item._options.filter(function(item) {
              // Get the correct item(s).
              return item._isCorrect;
            }).map(function(item) {
              // Prefix the option's index and offset by 1.
              return questionIndex + '_' + (item._index + 1).toString();
            })
          ].join('[.]');
        }).join('[,]')
      ];
      // The 'source' property contains an array of all the stems/questions, e.g.
      // [{id: "1", description: "First question"}, {id: "2", description: "Second question"}]
      interactions.source = _.flatten(items.map(function(item) {
        return {
          // Offset by 1.
          id: (item._index + 1).toString(),
          description: item.text
        };
      }));
      // The 'target' property contains an array of all the option responses, with the 'id'
      // prefixed to indicate the grouping, e.g.
      // [  {id: "1_1": description: "First option, group 1"},
      //    {id: "1_2": description: "Second option, group 1"}
      //    {id: "2_1": description: "First option, group 2"}  ]
      interactions.target = _.flatten(items.map(function(item, index) {
        // Offset by 1, as these values are not zero-indexed.
        index = index + 1;
        return item._options.map(function(option) {
          return {
            id: index + '_' + (option._index + 1),
            description: option.text
          };
        });
      }));
      return interactions;
    }

    /**
    * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
    * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
    * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
    * depending on which SCORM version is being used.
    */
    getResponse() {
      const responses = [];

      this.get('_userAnswer').forEach(function(userAnswer, index) {
        responses.push((index + 1) + '.' + (userAnswer + 1));// convert from 0-based to 1-based counting
      });

      return responses.join('#');
    }

    /**
    * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
    * @return {string}
    */
    getResponseType() {
      return 'matching';
    }

    /**
     * Creates a string explaining the answers the learner should have chosen
     * Used by ButtonsView to retrieve question-specific correct answer text for the ARIA
     * 'live region' that gets updated when the learner selects the 'show correct answer' button
     * @return {string}
     */
    getCorrectAnswerAsText() {
      const correctAnswerTemplate = Adapt.course.get('_globals')._components._matching.ariaCorrectAnswer;
      const ariaAnswer = this.get('_items').map(item => {
        const correctOption = _.findWhere(item._options, { _isCorrect: true });
        return Handlebars.compile(correctAnswerTemplate)({
          itemText: item.text,
          correctAnswer: correctOption.text
        });
      }).join('<br>');

      return ariaAnswer;
    }

    /**
     * Creates a string listing the answers the learner chose
     * Used by ButtonsView to retrieve question-specific user answer text for the ARIA
     * 'live region' that gets updated when the learner selects the 'hide correct answer' button
     * @return {string}
     */
    getUserAnswerAsText() {
      const userAnswerTemplate = Adapt.course.get('_globals')._components._matching.ariaUserAnswer;
      const answerArray = this.has('_tempUserAnswer') ?
        this.get('_tempUserAnswer') :
        this.get('_userAnswer');

      const ariaAnswer = this.get('_items').map((item, index) => {
        const key = answerArray[index];
        return Handlebars.compile(userAnswerTemplate)({
          itemText: item.text,
          userAnswer: item._options[key].text
        });
      }).join('<br>');

      return ariaAnswer;
    }

  };

  return MatchingModel;
});
