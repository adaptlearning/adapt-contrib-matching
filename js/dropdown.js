import DropDownOption from './dropdownOption';

class DropDown extends Backbone.View {

  initialize(settings) {
    _.bindAll(this, 'onStartInteraction', 'onButtonClick', 'onListBlur', 'onKeyDown');
    this.settings = _.defaults(settings, this.getDefaults());
    this.placeholder = null;
    this.options = [];
    this.setUpElements();
    this.setUpItems();
    this.select(this.settings.value);
    this.addEventListeners();
    this.toggleOpen(false);
    this.settings.load.call(this, this);
    this.trigger('load', this);
  }

  getDefaults() {
    return {
      load: DropDown.defaults.load,
      openList: DropDown.defaults.openList,
      closeList: DropDown.defaults.closeList,
      scrollToItem: DropDown.defaults.scrollToItem
    };
  }

  setUpElements() {
    this.$list = this.$('.js-dropdown-list');
    this.$button = this.$('.js-dropdown-btn');
    this.$inner = this.$button.find('.js-dropdown-inner');
    this.$input = this.$('.js-data-output');
  }

  setUpItems() {
    const $options = this.$('.js-dropdown-list-item');
    $options.each((index, el) => {
      const option = new DropDownOption({ parent: this, el });
      if (option.isPlaceholder()) {
        this.placeholder = option;
        return;
      }
      this.options.push(option);
    });
  }

  addEventListeners() {
    this.$button.on({
      'mousedown touchstart': this.onStartInteraction,
      click: this.onButtonClick
    });
    this.$list.on('blur', this.onListBlur);
    $(document).on('keydown', this.onKeyDown);
  }

  onStartInteraction() {
    this.wasOpen = this.isOpen();
  }

  deselectAll() {
    this.placeholder.deselect();
    this.options.forEach(option => {
      option.deselect();
    });
  }

  onButtonClick(event) {
    if (this.wasOpen || this.isOpen()) {
      // click toggle list:
      // if the list is open and the button is clicked
      // the blur event will fire first closing the list.
      // this code is to prevent the list from reopening
      // in that situation
      this.wasOpen = false;
      return;
    }
    this.toggleOpen();
    const option = this.getFirstSelectedItem() || this.placeholder;
    if (!option) return;
    option.reselect();
    option.scrollTo();
    this.$list.focus();
  }

  isOpen() {
    return !this.$list.hasClass('u-display-none');
  }

  toggleOpen(open) {
    if (open === undefined) open = !this.isOpen();
    if (open) clearTimeout(this.blurTimeout);
    this.$button.attr('aria-expanded', open ? 'true' : 'false');
    const name = open ? 'openList' : 'closeList';
    this.settings[name].call(this, this);
    this.trigger(name, this);
  }

  onListBlur(event) {
    // IE11: Allow option click handler to execute before blur and close list
    const handleBlur = () => {
      this.toggleOpen(false);
      this.removeActiveDescendantId();
    };
    this.blurTimeout = setTimeout(handleBlur, 100);
  }

  onKeyDown(event) {
    if (!this.isOpen()) return;
    let option = this.getFirstSelectedItem() || this.placeholder;
    switch (event.keyCode) {
      case 38: // UP
        event.preventDefault();
        option = option.getPrevious() || option.getLast();
        break;
      case 40: // DOWN
        event.preventDefault();
        option = option.getNext() || option.getFirst();
        break;
      case 13: // ENTER
      case 32: // SPACE
      case 27: // ESCAPE
        event.preventDefault();
        this.$button.focus();
        return;
      default:
        return;
    }
    option.select().scrollTo();
  }

  getFirstSelectedItem() {
    return _.find(this.options, option => {
      return option.isSelected();
    }) || this.options[0];
  }

  setActiveDescendantId(id) {
    this.$list.attr('aria-activedescendant', id);
  }

  removeActiveDescendantId() {
    this.$list.removeAttr('aria-activedescendant');
  }

  select(value) {
    value = String(value);
    const option = _.find(this.options, option => {
      return option.getValue() === value;
    });
    if (option) {
      option.select();
      return;
    }
    this.placeholder.select();
  }

  toggleDisabled(value) {
    if (value === undefined) {
      value = !this.$input.attr('disabled');
    }
    if (value === false) {
      this.$input.removeAttr('disabled');
      this.$button
        .removeAttr('disabled')
        .removeClass('is-disabled');
      this.$el.removeAttr('disabled');
      return;
    }
    this.$input.attr('disabled', '');
    this.$button
      .attr('disabled', '')
      .addClass('is-disabled');
    this.$el.attr('disabled', '');
  }

  isEmpty() {
    return !this.getFirstSelectedItem();
  }

  val() {
    return this.$input.val();
  }

  destroy() {
    this.removeEventListeners();
    this.$el.remove();
    delete this.options;
    delete this.$input;
    delete this.$inner;
    delete this.$button;
    delete this.$list;
    delete this.$el;
  }

  removeEventListeners() {
    this.$button.off({
      'mousedown touchstart': this.onStartInteraction,
      click: this.onButtonClick
    });
    this.$list.off('blur', this.onListBlur);
    $(document).off('keydown', this.onKeyDown);
  }

}

DropDown.defaults = {

  load: function() {},

  openList: function() {
    this.$list
      .css({
        top: '',
        left: this.$button[0].offsetLeft,
        width: this.$button.outerWidth()
      })
      .addClass('u-visibility-hidden')
      .removeClass('u-display-none');

    const offset = this.$list[0].getBoundingClientRect();
    const height = this.$list.height();
    const windowHeight = $(window).height();
    const isOffscreen = (offset.top + height > windowHeight);

    this.$list
      .css('top', isOffscreen ? -height : '')
      .removeClass('u-visibility-hidden')
      .focus();

  },

  closeList: function() {
    this.$list
      .removeClass('u-visibility-hidden')
      .addClass('u-display-none')
      .css('top', '');
  },

  scrollToItem: function(option) {
    const height = this.$list[0].clientHeight;
    const pos = option.$el[0].offsetTop - (height / 2);
    this.$list[0].scrollTop = pos;
  }
};

export default DropDown;
