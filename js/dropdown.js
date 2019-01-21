define([
  './dropdownOption',
  'handlebars'
], function(DropDownOption, Handlebars) {

  var DropDown = Backbone.View.extend({

    initialize: function(settings) {
      _.bindAll(this, "onStartInteraction", "onNativeSelectChange", "onButtonClick", "onListBlur", "onKeyDown");
      this.settings = _.defaults(settings, this.getDefaults());
      this.placeholder = null;
      this.options = [];
      this.setUpElements();
      this.setUpItems();
      this.select(this.settings.value);
      this.addEventListeners();
      this.toggleOpen(false);
      this.settings.load.call(this, this);
      this.trigger("load", this);
    },

    getDefaults: function() {
      return {
        useNative: false,
        load: DropDown.defaults.load,
        openList: DropDown.defaults.openList,
        closeList: DropDown.defaults.closeList,
        scrollToItem: DropDown.defaults.scrollToItem
      };
    },

    setUpElements: function() {
      if (this.$el.is(".is-native")) {
        this.settings.useNative = true;
        this.$button = this.$el;
        this.$input = this.$list = this.$("select");
        return;
      }
      this.$list = this.$(this.getTagName());
      this.$button = this.$("button");
      this.$inner = this.$("button .dropdown__inner");
      this.$input = this.$("input");
    },

    getTagName: function() {
      if (this.isNativeSelect()) return 'select';
      return 'ul';
    },

    setUpItems: function() {
      var $options = this.$(this.getItemTagName());
      $options.each(function(index, el) {
        new DropDownOption({
          parent: this,
          el: el
        });
      }.bind(this));
    },

    getItemTagName: function() {
      if (this.isNativeSelect()) return 'option';
      return 'li';
    },

    isNativeSelect: function() {
      return this.settings.useNative;
    },

    addEventListeners: function() {
      if (this.isNativeSelect()) {
        this.$list.on({
          'mousedown touchstart': this.onStartInteraction,
          change: this.onNativeSelectChange
        });
        return;
      }

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

    onNativeSelectChange: function() {
      this.deselectAll();
      var controlValue = String(this.$list.val());
      _.find(this.options, function(option) {
        if (controlValue !== option.getValue()) return;
        option.select();
        return true;
      });
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
        return this.wasOpen = false;
      }
      this.toggleOpen();
      var option = this.getFirstSelectedItem() || this.placeholder;
      if (!option) return;
      option.reselect();
      option.scrollTo();
      this.$list.focus();
    },

    isOpen: function() {
      return !this.$list.hasClass('hidden');
    },

    toggleOpen: function(open) {
      if (this.isNativeSelect()) return;
      if (open === undefined) open = !this.isOpen();
      this.$button.attr('aria-expanded', open ? 'true' : 'false');
      var name = open ? 'openList' : 'closeList';
      this.settings[name].call(this, this);
      this.trigger(name, this);
    },

    onListBlur: function() {
      this.toggleOpen(false);
      this.removeActiveDescendentId();
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
          event.preventDefault();
          this.$button.focus();
          return;
        case 27: // ESCAPE
          event.preventDefault();
          this.$button.focus();
          return;
        default:
          return;
      }
      this.deselectAll();
      option.select().scrollTo();
    },

    getFirstSelectedItem: function() {
      return _.find(this.options, function(option) {
        if (option.isSelected()) return option;
      });
    },

    setActiveDescendentId: function(id) {
      if (this.isNativeSelect()) return;
      this.$list.attr('aria-activedescendant', id);
    },

    removeActiveDescendentId: function() {
      this.$list.removeAttr('aria-activedescendant');
    },

    select: function(value) {
      value = String(value);
      var option = _.find(this.options, function(option) {
        if (option.getValue() !== value) return false
        option.select();
        return true
      });
      if (option) return;
      this.placeholder.select();
    },

    toggleDisabled: function(value) {
      if (value === undefined) value != this.$input.attr("disabled");
      if (value === false) {
        this.$input.removeAttr("disabled");
        this.$button.removeAttr("disabled");
        this.$el.removeAttr("disabled");
        return;
      }
      this.$input.attr("disabled", "");
      this.$button.attr("disabled", "");
      this.$el.attr("disabled", "");
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
      if (this.isNativeSelect()) {
        this.$list.off({
          'mousedown touchstart': this.onStartInteraction,
          change: this.onNativeSelectChange
        });
        return;
      }
      this.$button.off({
        'mousedown touchstart': this.onStartInteraction,
        click: this.onButtonClick
      });
      this.$list.off('blur', this.onListBlur);
      $(document).off({
        keydown: this.onKeyDown
      });
    }

  }, {

    defaults: {

      load: function() {},

      openList: function() {
        this.$list
          .css({
            left: this.$button[0].offsetLeft,
            width: this.$button[0].offsetWidth
          })
          .addClass('sizing')
          .removeClass('hidden');

        var offset = this.$list[0].getBoundingClientRect();
        var height = this.$list.height();
        var windowHeight = $(window).height();
        var isOffscreen = (offset.top + height > windowHeight);

        this.$list
          .css({
            top: isOffscreen ? -height : ''
          })
          .removeClass('sizing');

        _.delay(function() {
          this.$list.focus();
        }.bind(this), 250);

      },

      closeList: function() {
        this.$list
          .removeClass('sizing')
          .addClass('hidden', true);
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
