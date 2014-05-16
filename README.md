#adapt-contrib-matching


A question component that allows the learner to match the options to question stems.

##Installation

First, be sure to install the [Adapt Command Line Interface](https://github.com/adaptlearning/adapt-cli), then from the command line run:-

        adapt install adapt-contrib-matching

This component can also be installed by adding the component to the adapt.json file before running `adapt install`:
 
        "adapt-contrib-matching": "*"

##Usage

Once installed, the component can be used to create a question with one or more drop-down based answers. Once the learner selects all their answers, the question may be submitted.

Upon submission, feedback is provided via the [tutor extension](https://github.com/adaptlearning/adapt-contrib-tutor), if installed. Feedback can be provided for correct, incorrect and partially correct answers.

If all answers are correct, no further learner interaction is available.

If one or more answers are incorrect, the user may reset their submission, and try again. The amount of times they can do this is determined by the ``_attempts`` setting. Subsequent submissions are treated as before, until the maximum number of attempts is reached. At this point, the user is presented with the opportunity to view the model answer, and compare this with their own submission. Further submission is not available.

##Settings overview


Matching components are comprised of question ``text`` and one or more answer ``items``. Each answer item contains multiple ``options``, consisting of ``text`` and ``correct`` attributes.

For example JSON format, see [example.json](https://github.com/adaptlearning/adapt-contrib-matching/blob/master/example.json)


####_classes

You can use this setting to add custom classes to your template and LESS file.

####_layout

This defines the position of the component in the block. Values can be `full`, `left` or `right`. 

####_component

This value must be: `matching`

####_attempts

Default: `1`

Specifies the number of attempts for this question

####_isRandom

Default: `false`

Setting this value to `true` will cause the `_items` to appear in a random order each time this component is loaded.

####placeholder

Use `placeholder` to set the text that will be displayed in the drop down answers before a user has made a selection.

####_items

Multiple `_items` can be entered for each matching question component. `_items` are made up of a text question and  `_options`. the `_options` are made up of multiple values for `text` and `_isCorrect`. The `_options` form the drop down answers. 

####text

Set some question text for this set of options.

####_options 

This can comprise multiple sets of values for `text` and `_isCorrect`

####text

Enter a value for a drop down answer.

####_isCorrect

Value can be `true` or `false`. Use `true` for options that must be selected for a correct answer.
 
##Limitations

To be completed.

 
##Browser spec
 
This component has been tested to the standard Adapt browser specification.
