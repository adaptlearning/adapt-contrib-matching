import ItemModel from 'core/js/models/itemModel';

export default class MatchingItemModel extends ItemModel {

  defaults() {
    return ItemModel.resultExtend('defaults', {
      _isHighlighted: false
    });
  }

  toggleHighlighted(isHighlighted = !this.get('_isHighlighted')) {
    this.set('_isHighlighted', isHighlighted);
  }

}
