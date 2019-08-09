define([
  './dropdownOption'
], function(DropDownOption) {

  var DropDown = Backbone.View.extend({

    initialize: function(settings) {
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
    },

    getDefaults: function() {
      return {
        load: DropDown.defaults.load,
        openList: DropDown.defaults.openList,
        closeList: DropDown.defaults.closeList,
        scrollToItem: DropDown.defaults.scrollToItem
      };
    },

    setUpElements: function() {
      this.$list = this.$('.js-dropdown-list');
      this.$button = this.$('.js-dropdown-btn');
      this.$inner = this.$button.find('.js-dropdown-inner');
      this.$input = this.$('.js-data-output');
    },

    setUpItems: function() {
      var $options = this.$('.js-dropdown-list-item');
      $options.each(function(index, el) {
        var option = new DropDownOption({
          parent: this,
          el: el
        });
        if (option.isPlaceholder()) {
          this.placeholder = option;
          return;
        }
        this.options.push(option);
      }.bind(this));
    },

    addEventListeners: function() {
      this.$button.on({
        'mousedown touchstart': this.onStartInteraction,
        click: this.onButtonClick
      });
      this.$list.on('blur', this.onListBlur);
      $(document).on('keydown', this.onKeyDown);
    },

    onStartInteraction: function() {
      this.wasOpen = this.isOpen();
    },

    deselectAll: function() {
      this.placeholder.deselect();
      this.options.forEach(function(option) {
        option.deselect();
      });
    },

    onButtonClick: function(event) {
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
      var option = this.getFirstSelectedItem() || this.placeholder;
      if (!option) return;
      option.reselect();
      option.scrollTo();
      this.$list.focus();
    },

    isOpen: function() {
      return !this.$list.hasClass('u-display-none');
    },

    toggleOpen: function(open) {
      if (open === undefined) open = !this.isOpen();
      if (open) clearTimeout(this.blurTimeout);
      this.$button.attr('aria-expanded', open ? 'true' : 'false');
      var name = open ? 'openList' : 'closeList';
      this.settings[name].call(this, this);
      this.trigger(name, this);
    },

    onListBlur: function(event) {
      // IE11: Allow option click handler to execute before blur and close list
      var handleBlur = function() {
        this.toggleOpen(false);
        this.removeActiveDescendantId();
      }.bind(this);
      this.blurTimeout = setTimeout(handleBlur, 100);
    },

    onKeyDown: function(event) {
      if (!this.isOpen()) return;
      var option = this.getFirstSelectedItem() || this.placeholder;
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
    },

    getFirstSelectedItem: function() {
      return _.find(this.options, function(option) {
        return option.isSelected();
      });
    },

    setActiveDescendantId: function(id) {
      this.$list.attr('aria-activedescendant', id);
    },

    removeActiveDescendantId: function() {
      this.$list.removeAttr('aria-activedescendant');
    },

    select: function(value) {
      value = String(value);
      var option = _.find(this.options, function(option) {
        return option.getValue() === value;
      });
      if (option) {
        option.select();
        return;
      }
      this.placeholder.select();
    },

    toggleDisabled: function(value) {
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
    },

    isEmpty: function() {
      return !this.getFirstSelectedItem();
    },

    val: function() {
      return this.$input.val();
    },

    destroy: function() {
      this.removeEventListeners();
      this.$el.remove();
      delete this.options;
      delete this.$input;
      delete this.$inner;
      delete this.$button;
      delete this.$list;
      delete this.$el;
    },

    removeEventListeners: function() {
      this.$button.off({
        'mousedown touchstart': this.onStartInteraction,
        click: this.onButtonClick
      });
      this.$list.off('blur', this.onListBlur);
      $(document).off('keydown', this.onKeyDown);
    }

  }, {

    defaults: {

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

        var offset = this.$list[0].getBoundingClientRect();
        var height = this.$list.height();
        var windowHeight = $(window).height();
        var isOffscreen = (offset.top + height > windowHeight);

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
        var height = this.$list[0].clientHeight;
        var pos = option.$el[0].offsetTop-(height/2);
        this.$list[0].scrollTop = pos;
      }

    }

  });

  return DropDown;

});
