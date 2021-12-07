// import Adapt from 'core/js/adapt';
import QuestionView from 'core/js/views/questionView';

class MatchingView extends QuestionView {

  preinitialize() {
    this.setActiveOption = (...args) => this.model.setActiveOption(...args);
    this.setHighlightedOption = (...args) => this.model.setHighlightedOption(...args);
  }

  setupQuestion() {
    this.model.setupRandomisation();
    this.model.setupInitialHighlighted();
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  // showCorrectAnswer() {
  //   this.model.get('_items').forEach(({ _options }, index) => {
  //     const correctOption = _options.find(({ _isCorrect }) => _isCorrect);
  //     this.selectValue(index, correctOption._index);
  //   });
  // }

  // hideCorrectAnswer() {
  //   const answerArray = this.model.has('_tempUserAnswer') ?
  //     this.model.get('_tempUserAnswer') :
  //     this.model.get('_userAnswer');

  //   this.model.get('_items').forEach(({ _options }, index) => {
  //     const key = answerArray[index];
  //     const value = _options[key]._index;
  //     this.selectValue(index, value);
  //   });
  // }

}

MatchingView.template = 'matching.jsx';

export default MatchingView;
