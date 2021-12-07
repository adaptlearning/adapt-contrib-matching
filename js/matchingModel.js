// import Adapt from 'core/js/adapt';
import MatchingItemModel from './MatchingItemModel';
import ItemsQuestionModel from 'core/js/models/itemsQuestionModel';

export default class MatchingModel extends ItemsQuestionModel {

  toJSON() {
    const json = super.toJSON();
    // Make sure _items and _options is updated from child collection
    json._items = this.get('_items');
    json._options = this.getChildren().toJSON();
    return json;
  }

  setUpItems() {
    let index = 0;
    const items = (this.get('_items') || []);
    const options = items.reduce((options, item, itemIndex) => {
      item._itemIndex = itemIndex;
      const itemOptions = (item._options || []);
      itemOptions.forEach(option => {
        option._globalIndex = null;
        option._index = index++;
        option._itemIndex = item._itemIndex;
        option._shouldBeSelected = Boolean(option._isCorrect);
      });
      options.push(...itemOptions);
      return options;
    }, []);
    this.set({
      _items: items,
      _selectable: items.length
    });
    // Use _options for getChildren instead of _items.
    // Note: This creates a small gap between the json config and the ItemsQuestionModel apis
    // as 'item' in the api refers now to 'options' from the json. Doing this allows the options
    // to inherit the scoring, save/restore and completion mechanisms normally reserve for _items
    this.setChildren(new Backbone.Collection(options, { model: MatchingItemModel }));
  }

  setupInitialHighlighted() {
    this.get('_items')?.forEach(({ _itemIndex }) => {
      const selectOption = this.getActiveItemOption(_itemIndex) || this.getFirstItemOption(_itemIndex);
      selectOption?.toggleHighlighted(true);
    });
  }

  resetItems() {
    super.resetItems();
    this.resetHighlightedItems();
    this.setupInitialHighlighted();
  }

  resetHighlightedItems() {
    this.getChildren().forEach(option => option.toggleHighlighted(false));
  }

  canSubmit() {
    // Can submit if every item has an active option
    const options = this.getChildren().models;
    const activeCount = options.reduce((count, option) => (count + (option.get('_isActive') ? 1 : 0)), 0);
    const canSubmit = (activeCount === this.get('_selectable'));
    return canSubmit;
  }

  getItemOptions(itemIndex) {
    return this.getChildren().filter(option => (option.get('_itemIndex') === itemIndex));
  }

  getActiveItemOption(itemIndex) {
    return this.getItemOptions(itemIndex).find(option => option.get('_isActive'));
  }

  getFirstItemOption(itemIndex) {
    return this.getItemOptions(itemIndex)[0];
  }

  setHighlightedOption(optionIndex) {
    const itemIndex = this.getItem(optionIndex).get('_itemIndex');
    const itemOptions = this.getItemOptions(itemIndex);
    itemOptions.forEach(option => {
      const isHighlighted = (option.get('_index') === optionIndex);
      option.toggleHighlighted(isHighlighted);
    });
  }

  setActiveOption(optionIndex) {
    const itemIndex = this.getItem(optionIndex).get('_itemIndex');
    const itemOptions = this.getItemOptions(itemIndex);
    itemOptions.forEach(option => {
      const isActive = (option.get('_index') === optionIndex);
      option.toggleHighlighted(isActive);
      option.toggleActive(isActive);
    });
    this.unsetDuplicateOptions(optionIndex);
  }

  unsetDuplicateOptions(optionIndex) {
    const allowOnlyUniqueAnswers = this.get('_allowOnlyUniqueAnswers');
    if (!allowOnlyUniqueAnswers) return;
    const itemIndex = this.getItem(optionIndex).get('_itemIndex');
    const activeItemOption = this.getActiveItemOption(itemIndex);
    const activeItemOptionText = activeItemOption.get('text');
    const otherActiveOptions = this.getChildren().filter(option => (option !== activeItemOption) && option.get('_isActive'));
    otherActiveOptions.forEach(option => {
      const optionText = option.get('text');
      const hasMatchingText = (activeItemOptionText === optionText);
      if (!hasMatchingText) return;
      option.toggleHighlighted(false);
      option.toggleActive(false);
    });
  }

  get maxScore() {
    if (!this.get('_hasItemScoring')) return super.maxScore;
    const items = this.get('_items') || [];
    const maxItemScores = items.map(({ _itemIndex }) => {
      const itemOptions = this.getItemOptions(_itemIndex);
      const optionScores = itemOptions.map(child => child.get('_score') || 0);
      optionScores.sort((a, b) => a - b);
      return optionScores[optionScores.length - 1] || 0;
    });
    maxItemScores.sort((a, b) => a - b);
    return maxItemScores.reverse().filter(score => score > 0).reduce((maxScore, score) => (maxScore += score), 0);
  }

  get minScore() {
    if (!this.get('_hasItemScoring')) return super.minScore;
    const items = this.get('_items') || [];
    const minItemScores = items.map(({ _itemIndex }) => {
      const itemOptions = this.getItemOptions(_itemIndex);
      const optionScores = itemOptions.map(child => child.get('_score') || 0);
      optionScores.sort((a, b) => a - b);
      return optionScores[0] || 0;
    });
    minItemScores.sort((a, b) => a - b);
    return minItemScores.filter(score => score < 0).reduce((minScore, score) => (minScore += score), 0);
  }

  /**
  * Used by tracking extensions to return an object containing the component's specific interactions.
  */
  getInteractionObject() {
    return {};
    // const interactions = {
    //   correctResponsesPattern: null,
    //   source: null,
    //   target: null
    // };
    // const items = this.get('_items');
    // // This contains an array with a single string value, matching the source 'id' with the correct
    // // matching target 'id' value. An example is as follows:
    // // [ "1[.]1_2[,]2[.]2_3" ]
    // interactions.correctResponsesPattern = [
    //   items.map(({ _options }, questionIndex) => {
    //     // Offset the item index and use it as a group identifier.
    //     questionIndex++;
    //     return [
    //       questionIndex,
    //       // Get the correct item(s).
    //       _options.filter(({ _isCorrect }) => _isCorrect).map(({ _index }) => {
    //         // Prefix the option's index and offset by 1.
    //         return `${questionIndex}_${_index + 1}`;
    //       })
    //     ].join('[.]');
    //   }).join('[,]')
    // ];
    // // The 'source' property contains an array of all the stems/questions, e.g.
    // // [{id: "1", description: "First question"}, {id: "2", description: "Second question"}]
    // interactions.source = items.map(item => {
    //   return {
    //     // Offset by 1.
    //     id: `${item._index + 1}`,
    //     description: item.text
    //   };
    // }).flat(Infinity);
    // // The 'target' property contains an array of all the option responses, with the 'id'
    // // prefixed to indicate the grouping, e.g.
    // // [  {id: "1_1": description: "First option, group 1"},
    // //    {id: "1_2": description: "Second option, group 1"}
    // //    {id: "2_1": description: "First option, group 2"}  ]
    // interactions.target = items.map(({ _options }, index) => {
    //   // Offset by 1, as these values are not zero-indexed.
    //   index++;
    //   return _options.map(option => {
    //     return {
    //       id: `${index}_${option._index + 1}`,
    //       description: option.text
    //     };
    //   });
    // }).flat(Infinity);
    // return interactions;
  }

  /**
  * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
  * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
  * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
  * depending on which SCORM version is being used.
  */
  getResponse() {
    return '';
    // const responses = this.get('_userAnswer').map((userAnswer, index) => {
    //   // convert from 0-based to 1-based counting
    //   return `${index + 1}.${userAnswer + 1}`;
    // });

    // return responses.join('#');
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
    return '';
    // const correctAnswerTemplate = Adapt.course.get('_globals')._components._matching.ariaCorrectAnswer;
    // const ariaAnswer = this.get('_items').map(item => {
    //   const correctOption = item._options.find(({ _isCorrect }) => _isCorrect);
    //   return Handlebars.compile(correctAnswerTemplate)({
    //     itemText: item.text,
    //     correctAnswer: correctOption.text
    //   });
    // }).join('<br>');

    // return ariaAnswer;
  }

  /**
   * Creates a string listing the answers the learner chose
   * Used by ButtonsView to retrieve question-specific user answer text for the ARIA
   * 'live region' that gets updated when the learner selects the 'hide correct answer' button
   * @return {string}
   */
  getUserAnswerAsText() {
    return '';
    // const userAnswerTemplate = Adapt.course.get('_globals')._components._matching.ariaUserAnswer;
    // const answerArray = this.has('_tempUserAnswer') ?
    //   this.get('_tempUserAnswer') :
    //   this.get('_userAnswer');

    // const ariaAnswer = this.get('_items').map((item, index) => {
    //   const key = answerArray[index];
    //   return Handlebars.compile(userAnswerTemplate)({
    //     itemText: item.text,
    //     userAnswer: item._options[key].text
    //   });
    // }).join('<br>');

    // return ariaAnswer;
  }
}
