# adapt-contrib-matching

<img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/matching01.gif" alt="Matching in action" align="right"> **Matching** is a *question component* bundled with the [Adapt framework](https://github.com/adaptlearning/adapt_framework).

Possible answers to the question are presented within one or more drop-downs. Upon submission, feedback is provided via the [**Tutor** extension](https://github.com/adaptlearning/adapt-contrib-tutor), if installed. Feedback can be provided for correct, incorrect and partially correct answers. The number of attempts allowed may be configured.

[Visit the **Matching** wiki](https://github.com/adaptlearning/adapt-contrib-matching/wiki) for more information about its functionality and for explanations of key properties.

## Installation

As one of Adapt's *[core components](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#components),* **Matching** is included with the [installation of the Adapt framework](https://github.com/adaptlearning/adapt_framework/wiki/Manual-installation-of-the-Adapt-framework#installation) and the [installation of the Adapt authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-Adapt-Origin).

* If **Matching** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
`adapt install adapt-contrib-matching`

    Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:
    `"adapt-contrib-matching": "*"`
    Then running the command:
    `adapt install`
    (This second method will reinstall all plug-ins listed in *adapt.json*.)

* If **Matching** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).
<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

The attributes listed below are used in *components.json* to configure **Matching**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-matching/blob/master/example.json). Visit the [**Matching** wiki](https://github.com/adaptlearning/adapt-contrib-matching/wiki) for more information about how they appear in the [authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki).

### Attributes

In addition to the attributes specifically listed below, [*question components*](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#question-components) can implement the following sets of attributes:
+ [**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. They have no default values. Like the attributes below, their values are assigned in *components.json*.
+ [**core buttons**](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons): Default values are found in *course.json*, but may be overridden by **Matching's** model in *components.json*.

**\_component** (string): This value must be: `matching`.

**\_classes** (string): CSS class name to be applied to **Matching**’s containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**\_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**ariaQuestion** (string): This will be read out by screen readers instead of reading the title, body & instruction fields when focusing on the group or radiogroup.

**\_attempts** (number): This specifies the number of times a learner is allowed to submit an answer. The default is `1`.

**\_shouldDisplayAttempts** (boolean): Determines whether or not the text set in **remainingAttemptText** and **remainingAttemptsText** will be displayed. These two attributes are part of the [core buttons](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons) attribute group. The default is `false`.

**\_shouldResetAllAnswers** (boolean): Setting this value to `false` will stop correct answers from being reset when the question is reset - this can be better experience for the learner in instances when there are many items for them to answer. The default is `true`.

**\_isRandom** (boolean): Setting this value to `true` will cause the possible answers associated with each *item* to appear in a random order each time the component is loaded. The default is `false`.

**\_isRandomQuestionOrder** (boolean): Setting this value to `true` will cause the *items* to appear in a random order each time the component is loaded. The default is `false`.

**\_questionWeight** (number): A number which reflects the significance of the question in relation to the other questions in the course. This number is used in calculations of the final score reported to the LMS.

**\_canShowModelAnswer** (boolean): Setting this to `false` prevents the [**\_showCorrectAnswer** button](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons) from being displayed. The default is `true`.

**\_canShowFeedback** (boolean): Setting this to `false` disables feedback, so it is not shown to the user. The default is `true`.

**\_canShowMarking** (boolean): Setting this to `false` prevents ticks and crosses being displayed on question completion. The default is `true`.

**\_recordInteraction** (boolean) Determines whether or not the learner's answers will be recorded to the LMS via cmi.interactions. Default is `true`. For further information, see the entry for `_shouldRecordInteractions` in the README for [adapt-contrib-spoor](https://github.com/adaptlearning/adapt-contrib-spoor).

**placeholder** (string): This is the text that is initially displayed on each drop-down. It is usually set to something like 'Please select an option'.

**\_allowOnlyUniqueAnswers** (boolean): When set to `false`, multiple items can be selected with the same option text. Defaults to `false`.

**\_hasItemScoring** (boolean): When set to `false`, this question scores 0 for incorrect and 'Question Weight' for correct. When enabled, this question scores by summing the scores of the selected options. Defaults to `false`.

**\_items** (array): Multiple items may be created. Each *item* represents one question and its possible answers. It contains values for **text** and multiple **\_options**.

>**text** (string): Text that functions as the question.

>**\_options** (array): Multiple options may be created. Each *option* functions as a possible answer to the question text. It contains values for **text** and **isCorrect**.

>>**text** (string): This is the value of the dropdown. It is the text of a possible answer.

>>**\_isCorrect** (boolean): This value determines whether the dropdown must be selected for a correct answer. Set to `true` if this *option* is a correct answer. The default is `false`.

**\_feedback** (object): If the [**Tutor** extension](https://github.com/adaptlearning/adapt-contrib-tutor) is enabled, these various texts will be displayed depending on the submitted answer. **\_feedback**
contains values for three types of answers: **correct**, **\_incorrect**, and **\_partlyCorrect**. Some attributes are optional. If they are not supplied, the default that is noted below will be used.

>**title** (string): Title text for the feedback that will be displayed when the question is submitted.

>**altTitle** (string): This will be read out by screen readers as an alternative title if no visual title is included.

>**correct** (string): Text that will be displayed when the submitted answer is correct.

>**\_incorrect** (object): Texts that will be displayed when the submitted answer is incorrect. It contains values that are displayed under differing conditions: **final** and **notFinal**.

>>**final** (string): Text that will be displayed when the submitted answer is incorrect and no more attempts are permitted.

>>**notFinal** (string): Text that will be displayed when the submitted answer is incorrect while more attempts are permitted. This is optional&mdash;if you do not supply it, the **\_incorrect.final** feedback will be shown instead.

>**\_partlyCorrect** (object): Texts that will be displayed when the submitted answer is partially correct. It contains values that are displayed under differing conditions: **final** and **notFinal**.

>>**final** (string): Text that will be displayed when the submitted answer is partly correct and no more attempts are permitted. This is optional&mdash;if you do not supply it, the **\_incorrect.final** feedback will be shown instead.

>>**notFinal** (string): Text that will be displayed when the submitted answer is partly correct while more attempts are permitted. This is optional&mdash;if you do not supply it, the **\_incorrect.notFinal** feedback will be shown instead.

### Accessibility
**Matching** has been assigned a descriptive label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion**.

When **Matching** is used with Adapt Framework v5.12.0 (or better), it supports announcing the correct/learner answer to screen readers (via an an [ARIA Live Region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)) when the Correct Answer button is toggled by the learner. The following attributes are used to provide this functionality: **ariaCorrectAnswer**, **ariaUserAnswer**.

These ARIA labels are not visible elements; they are used by assistive technology (such as screen readers). Should any of these labels need to be customised or translated, they can be found within the `_globals._components._matching` object in **course.json** (or Project settings > Globals in the Adapt Authoring Tool).

## Limitations

No known limitations.

<div float align=right><a href="#top">Back to Top</a></div>

-----------------------------

<a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-matching/graphs/contributors)<br>
**Accessibility support:** WAI AA<br>
**RTL support:** Yes<br>
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, Safari for macOS/iOS/iPadOS, Opera<br>
