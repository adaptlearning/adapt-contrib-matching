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

}

MatchingView.template = 'matching.jsx';

export default MatchingView;
