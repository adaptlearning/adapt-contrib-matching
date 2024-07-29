import React from 'react';
import { templates, classes, compile } from 'core/js/reactHelpers';

export default function Matching(props) {
  const {
    _id,
    _isEnabled,
    _isInteractionComplete,
    _isCorrect,
    _shouldShowMarking,
    _isCorrectAnswerShown,
    _items,
    _options,
    _globals,
    displayTitle,
    body,
    instruction,
    ariaQuestion
  } = props;

  const displayAsCorrect = (_isInteractionComplete && (_isCorrectAnswerShown || _isCorrect));

  return (
    <div className="component__inner matching__inner">

      <templates.header {...props} />

      <div
        className={classes([
          'component__widget matching__widget',
          !_isEnabled && 'is-disabled',
          _isInteractionComplete && 'is-complete is-submitted show-user-answer',
          displayAsCorrect && 'is-correct'
        ])}
        aria-labelledby={ariaQuestion ? null : (displayTitle || body || instruction) && `${_id}-header`}
        aria-label={ariaQuestion || null}
        role='group'
      >

        {_items.map(({
          text,
          _index
        }, index) => {
          const activeOption = _options.find(option => (option._itemIndex === _index) && option._isActive);
          const displayItemAsCorrect = (!_isEnabled && _shouldShowMarking && (_isCorrectAnswerShown || activeOption?._shouldBeSelected));
          return (
            <div key={_index} className={classes([
              'matching-item',
              'item',
              `item-${index}`,
              'js-matching-item',
              _shouldShowMarking && (displayItemAsCorrect ? 'is-correct' : 'is-incorrect')
            ])}>

              {text &&
              <div className="matching-item__title">
                <div id={`${_id}-matching-item-${_index}__title`} className="matching-item__title_inner" dangerouslySetInnerHTML={{ __html: compile(text) }}>
                </div>
              </div>
              }

              <div className="matching-item__select-container js-matching-item-select-container">

                <templates.matchingDropDown {...props} _itemIndex={_index} />

                <div className="matching-item__select-state">
                  <div className="matching-item__select-icon matching-item__select-correct-icon" aria-label={_globals._accessibility._ariaLabels.correct}>
                    <div className="icon" aria-hidden="true"></div>
                  </div>
                  <div className="matching-item__select-icon matching-item__select-incorrect-icon" aria-label={_globals._accessibility._ariaLabels.incorrect}>
                    <div className="icon" aria-hidden="true"></div>
                  </div>
                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="btn__container"></div>

    </div>
  );
}
