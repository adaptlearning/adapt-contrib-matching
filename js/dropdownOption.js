define(function() {

  var DropDownItem = Backbone.View.extend({

    events: {
      'click': 'onClick',
      'click *': 'onClick'
    },

    initialize: function(settings) {
      this.settings = settings;
      this.$inner = this.$('.js-dropdown-list-item-inner');
    },

    isPlaceholder: function() {
      return this.$el.is('[hidden]');
    },

    parent: function() {
      return this.settings.parent;
    },

    onClick: function(event) {
      var parent = this.parent();
      event.preventDefault();
      this.select().scrollTo();
      parent.$button.focus();
    },

    getValue: function() {
      return this.$el.attr('value').trim();
    },

    select: function() {
      var parent = this.parent();
      parent.deselectAll();
      parent.setActiveDescendantId(this.el.id);
      this.$el.attr({
        selected: '',
        'aria-selected': 'true'
      });
      parent.$inner.html(this.$el.attr('text'));
      var value = this.isPlaceholder() ? '' : this.getValue();
      parent.$input.val(value).trigger('change');
      parent.trigger('change', parent);
      return this;
    },

    deselect: function() {
      if (!this.isSelected()) return this;
      var parent = this.parent();
      parent.removeActiveDescendantId();
      this.$el.removeAttr('selected');
      this.$el.attr('aria-selected', 'false');
      parent.$inner.html('');
      parent.$input.val('').trigger('change');
      parent.trigger('change', parent);
      return this;
    },

    reselect: function() {
      var parent = this.parent();
      parent.setActiveDescendantId(this.$el[0].id);
      if (this.isSelected()) return this;
      this.select();
      return this;
    },

    isSelected: function() {
      return Boolean(this.$el.attr('selected'));
    },

    getIndex: function() {
      var parent = this.parent();
      return _.findIndex(parent.options, function(option) {
        return (option === this);
      }.bind(this));
    },

    getNext: function() {
      var parent = this.parent();
      return parent.options[this.getIndex()+1];
    },

    getPrevious: function() {
      var parent = this.parent();
      return parent.options[this.getIndex()-1];
    },

    getFirst: function() {
      var parent = this.parent();
      return parent.options[0];
    },

    getLast: function() {
      var parent = this.parent();
      return parent.options[parent.options.length-1];
    },

    scrollTo: function() {
      var parent = this.parent();
      parent.settings.scrollToItem.call(parent, this);
    },

    destroy: function() {
      var parent = this.parent();
      this.remove();
      if (this.isPlaceholder()) {
        parent.placeholder = null;
      } else {
        for (var i = 0, l = parent.options.length; i < l; i++) {
          var item = parent.options[i];
          if (item !== this) continue;
          parent.options.splice(i, 1);
          break;
        }
      }
      delete this.settings;
    }

  });

  return DropDownItem;

});
