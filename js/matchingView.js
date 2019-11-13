define([
  'core/js/adapt',
  'core/js/views/questionView',
  './dropdown'
], function(Adapt, QuestionView, DropDown) {

  var MatchingView = QuestionView.extend({

    dropdowns: null,

    disableQuestion: function() {
      this.dropdowns.forEach(function(dropdown) {
        dropdown.toggleDisabled(true);
      });
    },

    enableQuestion: function() {
      this.dropdowns.forEach(function(dropdown) {
        dropdown.toggleDisabled(false);
      });
    },

    resetQuestionOnRevisit: function() {
      this.resetQuestion();
    },

    setupQuestion: function() {
      this.listenToOnce(Adapt, 'preRemove', this.onPreRemove);
      this.model.setupRandomisation();
    },

    onPreRemove: function() {
      this.dropdowns.forEach(function(dropdown) {
        dropdown.off('change', this.onOptionSelected);
        dropdown.destroy();
      }, this);
    },

    onQuestionRendered: function() {
      this.setReadyStatus();
      this.setUpDropdowns();
    },

    setUpDropdowns: function() {
      _.bindAll(this, 'onOptionSelected');
      this.dropdowns = [];
      var items = this.model.get('_items');
      this.$('.matching__item').each(function(i, el) {
        var item = items[i];
        var selectedOption = _.find(item._options, function(option) {
          return option._isSelected;
        });
        var value = selectedOption ? selectedOption._index : null;
        var dropdown = new DropDown({
          el: $(el).find('.dropdown')[0],
          placeholder: this.model.get('placeholder'),
          value: value
        });
        this.dropdowns.push(dropdown);
        dropdown.on('change', this.onOptionSelected);
      }.bind(this));
      this.enableQuestion();
      if (this.model.get('_isEnabled') !== true) {
        this.disableQuestion();
      }
    },

    onCannotSubmit: function() {
      this.dropdowns.forEach(function(dropdown) {
        if (!dropdown.isEmpty()) return;
        dropdown.$el.parents('.matching__select-container').addClass('has-error');
      });
    },

    onOptionSelected: function(dropdown) {
      if (this.model.get('_isInteractionComplete')) return;
      var $container = dropdown.$el.parents('.matching__select-container');
      $container.removeClass('error');
      var itemIndex = dropdown.$el.parents('.matching__item').index();
      if (dropdown.isEmpty()) return;
      var optionIndex = parseInt(dropdown.val());
      this.model.setOptionSelected(itemIndex, optionIndex, true);
    },

    showMarking: function() {
      if (!this.model.get('_canShowMarking')) return;

      this.model.get('_items').forEach(function(item, i) {
        var $item = this.$('.matching__item').eq(i);
        $item.removeClass('is-correct is-incorrect').addClass(item._isCorrect ? 'is-correct' : 'is-incorrect');
      }, this);
    },

    resetQuestion: function() {
      this.$('.matching__item').removeClass('is-correct is-incorrect');
      this.model.set('_isAtLeastOneCorrectSelection', false);
      var resetAll = this.model.get('_shouldResetAllAnswers');

      this.model.get('_items').forEach(function(item, index) {
        if (item._isCorrect && resetAll === false) return;
        this.selectValue(index, null);
        item._options.forEach(function(option, index) {
          option._isSelected = false;
        });
        item._selected = null;
      }, this);
    },

    showCorrectAnswer: function() {
      this.model.get('_items').forEach(function(item, index) {
        var correctOption = _.findWhere(item._options, { _isCorrect: true });
        this.selectValue(index, correctOption._index);
      }, this);
    },

    hideCorrectAnswer: function() {
      var answerArray = this.model.has('_tempUserAnswer') ?
        this.model.get('_tempUserAnswer') :
        this.model.get('_userAnswer');

      this.model.get('_items').forEach(function (item, index) {
        var key = answerArray[index];
        var value = item._options[key]._index;
        this.selectValue(index, value);
      }, this);
    },

    /**
     * Sets the selected item of a dropdown
     * @param {number} index The index (0-based) of the dropdown
     * @param {string} value The option _index
     * @example
     * // Sets the third dropdown to option _index 1
     * this.selectValue(2, 1);
     */
    selectValue: function(index, optionIndex) {
      if (!this.dropdowns) return;
      var dropdown = this.dropdowns[index];
      if (!dropdown) return;
      dropdown.select(optionIndex);
    }

  });

  return MatchingView;
});
