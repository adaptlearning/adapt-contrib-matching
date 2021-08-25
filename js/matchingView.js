import Adapt from 'core/js/adapt';
import QuestionView from 'core/js/views/questionView';
import DropDown from './dropdown';

export default class MatchingView extends QuestionView {

  preinitialize() {
    this.dropdowns = [];
  }

  disableQuestion() {
    this.dropdowns.forEach(dropdown => {
      dropdown.toggleDisabled(true);
    });
  }

  enableQuestion() {
    this.dropdowns.forEach(dropdown => {
      dropdown.toggleDisabled(false);
    });
  }

  resetQuestionOnRevisit() {
    this.resetQuestion();
  }

  setupQuestion() {
    this.listenToOnce(Adapt.parentView, 'postRemove', this.onPostRemove);
    this.model.setupRandomisation();
  }

  onPostRemove() {
    this.dropdowns.forEach(dropdown => {
      dropdown.off('change', this.onOptionSelected);
      dropdown.destroy();
    });
  }

  onQuestionRendered() {
    this.setReadyStatus();
    this.setUpDropdowns();
  }

  setUpDropdowns() {
    _.bindAll(this, 'onOptionSelected');
    this.dropdowns = [];
    const items = this.model.get('_items');
    this.$('.matching__item').each((i, el) => {
      const item = items[i];
      const selectedOption = _.find(item._options, option => {
        return option._isSelected;
      });
      const value = selectedOption ? selectedOption._index : null;
      const dropdown = new DropDown({
        el: $(el).find('.dropdown')[0],
        placeholder: this.model.get('placeholder'),
        value: value
      });
      this.dropdowns.push(dropdown);
      dropdown.on('change', this.onOptionSelected);
    });
    this.enableQuestion();
    if (this.model.get('_isEnabled') !== true) {
      this.disableQuestion();
    }
  }

  onCannotSubmit() {
    this.dropdowns.forEach(dropdown => {
      if (!dropdown.isEmpty()) return;
      dropdown.$el.parents('.matching__select-container').addClass('has-error');
    });
  }

  onOptionSelected(dropdown) {
    if (this.model.get('_isInteractionComplete')) return;
    const $container = dropdown.$el.parents('.matching__select-container');
    $container.removeClass('error');
    const itemIndex = dropdown.$el.parents('.matching__item').index();
    if (dropdown.isEmpty()) return;
    const optionIndex = parseInt(dropdown.val());
    this.model.setOptionSelected(itemIndex, optionIndex, true);
  }

  showMarking() {
    if (!this.model.get('_canShowMarking')) return;

    this.model.get('_items').forEach((item, i) => {
      const $item = this.$('.matching__item').eq(i);
      $item.removeClass('is-correct is-incorrect').addClass(item._isCorrect ? 'is-correct' : 'is-incorrect');
    });
  }

  resetQuestion() {
    this.$('.matching__item').removeClass('is-correct is-incorrect');
    this.model.set('_isAtLeastOneCorrectSelection', false);
    const resetAll = this.model.get('_shouldResetAllAnswers');

    this.model.get('_items').forEach((item, index) => {
      if (item._isCorrect && resetAll === false) return;
      this.selectValue(index, null);
      item._options.forEach((option, index) => {
        option._isSelected = false;
      });
      item._selected = null;
    });
  }

  showCorrectAnswer() {
    this.model.get('_items').forEach((item, index) => {
      const correctOption = _.findWhere(item._options, { _isCorrect: true });
      this.selectValue(index, correctOption._index);
    });
  }

  hideCorrectAnswer() {
    const answerArray = this.model.has('_tempUserAnswer') ?
      this.model.get('_tempUserAnswer') :
      this.model.get('_userAnswer');

    this.model.get('_items').forEach((item, index) => {
      const key = answerArray[index];
      const value = item._options[key]._index;
      this.selectValue(index, value);
    });
  }

  /**
   * Sets the selected item of a dropdown
   * @param {number} index The index (0-based) of the dropdown
   * @param {string} value The option _index
   * @example
   * // Sets the third dropdown to option _index 1
   * this.selectValue(2, 1);
   */
  selectValue(index, optionIndex) {
    if (!this.dropdowns) return;
    const dropdown = this.dropdowns[index];
    if (!dropdown) return;
    dropdown.select(optionIndex);
  }

}
