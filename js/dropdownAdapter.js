define([
    'libraries/select2'
], function() {
	/*
     * issue/1543: fix from https://github.com/select2/select2/issues/4063
     */
    var dropdownAdapter;
    jQuery.fn.select2.amd.require([
        "select2/utils",
        "select2/dropdown",
        "select2/dropdown/attachContainer",
        "select2/dropdown/closeOnSelect"
    ], function(Utils, DropdownAdapter, AttachContainer, CloseOnSelect) {

        /*
         * issues/1889: fix from https://github.com/adaptlearning/adapt_framework/issues/1889
         * code added to make dropdown sit above body bottom where appropriate
         */
        AttachContainer.prototype.bind = function(decorated, container, $container) {

            decorated.call(this, $container, $container);

            container.on('opening', function () {
                // hide so that popup doesn't jump when repositioned
                this.$dropdown.css("visibility", "hidden");
            }.bind(this));

            container.on('open', function () {
                // add dropdown at this point so that the browser focus works correctly
                var $dropdownContainer = $container.find('.dropdown-wrapper');
                $dropdownContainer.append(this.$dropdown);

                // defer to allow dom to settle before repositioning
                setTimeout(function() {
                    this.position(this.$dropdown, $container);
                    this.$dropdown.css("visibility", "");
                }.bind(this), 0);

            }.bind(this));

        };

        AttachContainer.prototype.position = function(decorated, $dropdown, $container) {

            var $window = $(window);

            var viewport = {
                top: $window.scrollTop(),
                bottom: $window.scrollTop() + $window.height()
            };

            var container = $container.offset();
            container.height = $container.outerHeight(false);
            container.bottom = container.top + container.height;

            var dropdown = {
                height: $dropdown.outerHeight(false)
            };

            var enoughRoomBelow = !dropdown.height || viewport.bottom > (container.bottom + dropdown.height);

            var oldDirection = $dropdown.hasClass('select2-dropdown--above') ? "above" : $dropdown.hasClass('select2-dropdown--below') ? "below" : "none";
            var newDirection = !enoughRoomBelow ? "above" : "below";

            if (newDirection === oldDirection) return;

            $dropdown
                .removeClass('select2-dropdown--below select2-dropdown--above')
                .addClass('select2-dropdown--' + newDirection);
            $container
                .removeClass('select2-container--below select2-container--above')
                .addClass('select2-container--' + newDirection);

            switch (newDirection) {
                case "below":
                    $dropdown.css("bottom", "");
                    break;
                case "above":
                    $dropdown.css("bottom", container.height);
                    break;
            }

        };


        // override default AttachBody
        dropdownAdapter = Utils.Decorate(
            Utils.Decorate(
                DropdownAdapter,
                AttachContainer
            ),
            CloseOnSelect
        );

    });

    return dropdownAdapter;
});