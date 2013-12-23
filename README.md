adapt-contrib-matching
======================

A question component that allows the learner to match the options to question stems.

Installation
------------

First, be sure to install the [Adapt Command Line Interface](https://github.com/cajones/adapt-cli), then from the command line run:-

		adapt install adapt-contrib-matching

Usage
-----
Once installed, the component can be used to create a question with one or more drop-down based answers. Once the learner selects all their answers, the question may be submitted.

Upon submission, feedback is provided via the [tutor extension](https://github.com/adaptlearning/adapt-contrib-tutor), if installed. Feedback can be provided for correct, incorrect and partially correct answers.

If all answers are correct, no further learner interaction is available.

If one or more answers are incorrect, the user may reset their submission, and try again. The amount of times they can do this is determined by the ``_attempts`` setting. Subsequent submissions are treated as before, until the maximum number of attempts is reached. At this point, the user is presented with the opportunity to view the model answer, and compare this with their own submission. Further submission is not available.

JSON Format
-----------

Matching components are comprised of question ``text`` and one or more answer ``items``. Each answer item contains multiple ``options``, consisting of ``text`` and ``correct`` attributes.

For example JSON format, see [example.json](https://github.com/adaptlearning/adapt-contrib-matching/blob/master/example.json)
