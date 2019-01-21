define(function() {

  var DropDownItem = Backbone.View.extend({

    initialize: function(settings) {
      _.bindAll(this, 'onClick');
      this.settings = settings;
      this.$inner = this.$el.find('span');
      this.addToParent();
      this.setUpEventListeners();
    },

    addToParent: function() {
      var parent = this.parent();
      if (this.isPlaceholder()) {
        parent.placeholder = this;
      } else {
        parent.options.push(this);
      }
      parent.$list.append(this.$el);
    },

    isPlaceholder: function() {
      return this.$el.is('[hidden]');
    },

    parent: function() {
      return this.settings.parent;
    },

    isNativeSelect: function() {
      return this.parent().isNativeSelect();
    },

    setUpEventListeners: function() {
      if (this.isNativeSelect()) return;
      this.$el.on("click", this.onClick);
    },

    onClick: function(event) {
      var parent = this.parent();
      event.preventDefault();
      parent.deselectAll();
      this.select().scrollTo();
      parent.$button.focus();
    },

    getValue: function() {
      return this.$el.attr('value').trim();
    },

    select: function() {
      var parent = this.parent();
      parent.setActiveDescendentId(this.$el[0].id);
      this.$el.attr('selected', '');
      parent.$input.val(this.getValue());
      if (this.isNativeSelect()) {
        parent.trigger('change', parent);
        return this;
      }
      this.$el.attr('aria-selected', 'true');
      parent.$inner.html(this.$el.attr('text'));
      parent.$input
        .attr('value', this.$el.attr('value'))
        .trigger('change');
      parent.trigger('change', parent);
      return this;
    },

    deselect: function() {
      var parent = this.parent();
      this.$el.removeAttr('selected');
      if (this.isNativeSelect()) return this;
      this.$el.attr('aria-selected', 'false');
      return this;
    },

    reselect: function() {
      var parent = this.parent();
      parent.setActiveDescendentId(this.$el[0].id);
      if (this.isSelected()) return this;
      parent.deselectAll();
      this.select();
      return this;
    },

    isSelected: function() {
      return Boolean(this.$el.attr('selected'));
    },

    getNext: function() {
      var parent = this.parent();
      var found = null;
      _.find(parent.options, function(option, index) {
        if (option !== this) return;
        return found = parent.options[index+1];
      }.bind(this));
      return found;
    },

    getPrevious: function() {
      var parent = this.parent();
      var found = null;
       _.find(parent.options, function(option, index) {
        if (option !== this) return;
        return found = parent.options[index-1];
      }.bind(this));
      return found;
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
      this.$el.remove();
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
      delete this.$el;
      delete this.settings;
    }

  });

  return DropDownItem;

});
