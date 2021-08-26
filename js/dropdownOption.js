export default class DropDownItem extends Backbone.View {

  events() {
    return {
      click: 'onClick',
      'click *': 'onClick'
    };
  }

  initialize(settings) {
    this.settings = settings;
    this.$inner = this.$('.js-dropdown-list-item-inner');
  }

  isPlaceholder() {
    return this.$el.is('[hidden]');
  }

  parent() {
    return this.settings.parent;
  }

  onClick(event) {
    const parent = this.parent();
    event.preventDefault();
    this.select().scrollTo();
    parent.$button.focus();
  }

  getValue() {
    return this.$el.attr('value').trim();
  }

  select() {
    const parent = this.parent();
    parent.deselectAll();
    parent.setActiveDescendantId(this.el.id);
    this.$el.attr({
      selected: '',
      'aria-selected': 'true'
    });
    parent.$inner.html(this.$el.attr('text'));
    const value = this.isPlaceholder() ? '' : this.getValue();
    parent.$input.val(value).trigger('change');
    parent.trigger('change', parent);
    return this;
  }

  deselect() {
    if (!this.isSelected()) return this;
    const parent = this.parent();
    parent.removeActiveDescendantId();
    this.$el.removeAttr('selected');
    this.$el.attr('aria-selected', 'false');
    parent.$inner.html('');
    parent.$input.val('').trigger('change');
    parent.trigger('change', parent);
    return this;
  }

  reselect() {
    const parent = this.parent();
    parent.setActiveDescendantId(this.$el[0].id);
    if (this.isSelected()) return this;
    this.select();
    return this;
  }

  isSelected() {
    return Boolean(this.$el.attr('selected'));
  }

  getIndex() {
    const parent = this.parent();
    return parent.options.findIndex(option => option === this);
  }

  getNext() {
    const parent = this.parent();
    return parent.options[this.getIndex() + 1];
  }

  getPrevious() {
    const parent = this.parent();
    return parent.options[this.getIndex() - 1];
  }

  getFirst() {
    const parent = this.parent();
    return parent.options[0];
  }

  getLast() {
    const parent = this.parent();
    return parent.options[parent.options.length - 1];
  }

  scrollTo() {
    const parent = this.parent();
    parent.settings.scrollToItem.call(parent, this);
  }

  destroy() {
    const parent = this.parent();
    this.remove();
    if (this.isPlaceholder()) {
      parent.placeholder = null;
    } else {
      for (let i = 0, l = parent.options.length; i < l; i++) {
        const item = parent.options[i];
        if (item !== this) continue;
        parent.options.splice(i, 1);
        break;
      }
    }
    delete this.settings;
  }

}
