/*
* adapt-contrib-matching
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {
  var Adapt = require('coreJS/adapt');
  var QuestionView = require('coreViews/questionView');

  var Matching = QuestionView.extend({

    events: {
      "change .matching-select": "onSelectChanged",
      "click .matching-widget .button.submit": "onSubmitClicked",
      "click .matching-widget .button.reset": "onResetClicked",
      "click .matching-widget .button.model": "onModelAnswerClicked",
      "click .matching-widget .button.user": "onUserAnswerClicked"
    },

     preRender:function(){
        QuestionView.prototype.preRender.apply(this);

        if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
            _.each(this.model.get('items'), function(item) {             
              item.options =  _.shuffle(item.options); 
            })
         }
    },

    postRender: function() {
      QuestionView.prototype.postRender.apply(this);
      this.setReadyStatus();
    },

    canSubmit: function() {
      var canSubmit = true;
      $('.matching-select option:selected',this.el).each(
        _.bind(function(index, element) {
          var $element = $(element);
          if ($element.index()==0) {
            canSubmit = false;
            $element.parent('.matching-select').addClass('error');
          }
        }, this));
      return canSubmit;
    },

    forEachAnswer: function(callback) {
      _.each(this.model.get('_items'), function(item, index) {
        var $selectedOption = this.$('.matching-select option:selected').eq(index);
        var correctSelection = item._options[$selectedOption.index()-1]._isCorrect;
        if (correctSelection) {
          item._isCorrect = true;
          this.model.set('_isAtLeastOneCorrectSelection', true);
        } else {
          item._isCorrect = false;
        }
        callback(correctSelection, item);
      }, this);
    },

    markQuestion: function() {
      this.forEachAnswer(function(correct, item) {
        item.correct = correct;
      });
      QuestionView.prototype.markQuestion.apply(this);
    },

    onEnabledChanged: function() {
      this.$('.matching-select').prop('disabled', !this.model.get('_isEnabled'));
    },

    onModelAnswerShown: function() {
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

    onSelectChanged: function(event) {
      $(event.target).blur();
    },

    onUserAnswerShown: function(event) {
      for(var i = 0, count = this.model.get('_items').length; i < count; i++) {
        var $parent = this.$('.matching-select').eq(i);
        this.selectOption($parent, this.model.get('_userAnswer')[i]);
      }
    },

    selectOption: function($parent, optionIndex) {
      $("option", $parent).eq(optionIndex).attr('selected', 'selected');
      $parent[0].selectedIndex = optionIndex; 
    },

    storeUserAnswer: function() {
      var userAnswer = [];
      _.each(this.model.get('_items'), function(item, index) {
        var $selectedOption = this.$('.matching-select option:selected').eq(index);
        userAnswer.push($selectedOption.index());
      }, this);
      this.model.set('_userAnswer', userAnswer);
    }

  });

  Adapt.register("matching", Matching);

});
