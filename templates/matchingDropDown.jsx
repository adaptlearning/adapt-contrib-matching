import React, { useRef, useState, useEffect } from 'react';
import { classes, compile } from 'core/js/reactHelpers';

export default function MatchingDropDown(props) {
  const button = useRef(null);
  const list = useRef(null);

  const [ wasOpen, setWasOpen ] = useState(false);
  const [ isOpen, setIsOpen ] = useState(false);
  const [ isShown, setIsShown ] = useState(false);
  const [ blurTimeoutHandle, setBlurTimeoutHandle ] = useState(null);
  const [ isListOffScreen, setIsListOffScreen ] = useState(false);
  const [ listHeight, setListHeight ] = useState(null);
  const [ buttonWidth, setButtonWidth ] = useState(null);
  const [ buttonOffsetLeft, setButtonOffsetLeft ] = useState(null);

  const onStartInteraction = () => setWasOpen(isOpen);

  const onButtonClick = () => {
    if (wasOpen || isOpen) {
      // Click toggle list:
      // If the list is open and the button is clicked
      // the blur event will fire first closing the list.
      // this code is to prevent the list from reopening
      // in that situation
      setIsOpen(false);
      return;
    }
    if (blurTimeoutHandle) {
      clearTimeout(blurTimeoutHandle);
      setBlurTimeoutHandle(null);
    }
    setIsShown(false);
    setIsOpen(true);
    setTimeout(() => {
      const offset = list?.current.getBoundingClientRect();
      const height = $(list?.current).height();
      const windowHeight = $(window).height();
      setIsListOffScreen(offset.top + height > windowHeight);
      setListHeight(height);
      setButtonOffsetLeft(button?.current.offsetLeft);
      setButtonWidth($(button?.current).outerWidth());
      setIsShown(true);
      list?.current.focus();
      scrollToHighlightedListItem();
    }, 100);
  };

  const scrollToHighlightedListItem = () => {
    if (!list?.current) return;
    const highlighted = $('li[aria-selected]', list.current)[0];
    if (!highlighted) return;
    const height = list.current.clientHeight;
    const pos = highlighted.offsetTop - (height / 2);
    list.current.scrollTop = pos;
  };

  const onOptionClicked = event => {
    const li = $(event.target).closest('li');
    const optionIndex = $(li).val();
    const option = options.find(option => option._index === optionIndex);
    chooseOption(option);
  };

  const chooseOption = option => {
    setActiveOption(option._index);
    button?.current.focus();
  };

  const onListBlur = () => {
    if (!isOpen) return;
    // IE11: Allow option click handler to execute before blur and close list
    const handleBlur = () => {
      setIsShown(false);
      setIsOpen(false);
    };
    setBlurTimeoutHandle(setTimeout(handleBlur, 100));
  };

  /** Force blur if focus is lost from the list without triggering onListBlur */
  const onDocumentClick = event => {
    if (!isOpen) return;
    const parents = [document.activeElement, ...$(document.activeElement).parents().toArray()];
    if (parents.includes(list?.current)) return;
    onListBlur(event);
  };

  /** Accessibility keyboard controls */
  const KEYCODE = {
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    SPACE: 32,
    ESCAPE: 27
  };
  const validKeyCodes = Object.values(KEYCODE);
  const onDocumentKeyDown = event => {
    if (!isOpen || !validKeyCodes.includes(event.keyCode)) return;
    switch (event.keyCode) {
      case KEYCODE.UP: {
        event.preventDefault();
        const option = getPreviousOption() || getLastOption();
        highlightOption(option);
        break;
      }
      case KEYCODE.DOWN: {
        event.preventDefault();
        const option = getNextOption() || getFirstOption();
        highlightOption(option);
        break;
      }
      case KEYCODE.ENTER:
      case KEYCODE.SPACE:
        event.preventDefault();
        chooseOption(highlightedOption);
        break;
      case KEYCODE.ESCAPE:
        event.preventDefault();
        button?.current.focus();
    }
  };

  const getCurrentOptionIndex = () => options.findIndex(option => option === highlightedOption);
  const getPreviousOption = () => options[getCurrentOptionIndex() - 1];
  const getLastOption = () => options[options.length - 1];
  const getNextOption = () => options[getCurrentOptionIndex() + 1];
  const getFirstOption = () => options[0];

  const highlightOption = option => {
    setHighlightedOption(option._index);
    scrollToHighlightedListItem();
  };

  /** Document event attachment for click and keydown */
  useEffect(() => {
    document.addEventListener('click', onDocumentClick, { capture: true });
    document.addEventListener('keydown', onDocumentKeyDown);
    return () => {
      document.removeEventListener('click', onDocumentClick, { capture: true });
      document.removeEventListener('keydown', onDocumentKeyDown);
    };
  }, [onDocumentKeyDown, onDocumentClick]);

  const {
    _id,
    _isEnabled,
    placeholder,
    _itemIndex,
    _options,
    _isCorrectAnswerShown,
    setActiveOption,
    setHighlightedOption
  } = props;

  const options = _options.filter(({ _itemIndex: itemIndex }) => (itemIndex === _itemIndex) || (itemIndex === -1));
  const activeOption = options.find(option => (option._itemIndex === _itemIndex) && option._isActive) || { text: placeholder };
  const highlightedOption = options.find(option => (option._itemIndex === _itemIndex) && option._isHighlighted) || { text: placeholder };

  const correctActiveOption = activeOption?._shouldBeSelected
    ? activeOption
    : options.find(option => option._shouldBeSelected);

  const displayActiveOption = _isCorrectAnswerShown
    ? correctActiveOption
    : activeOption;

  const hasActiveOption = Boolean(options.find(option => (option._itemIndex === _itemIndex) && option._isActive));

  return (
    <div className="dropdown" disabled={!_isEnabled}>

      <button
        disabled={!_isEnabled}
        className={classes([
          'dropdown__btn js-dropdown-btn',
          !_isEnabled && 'is-disabled',
          hasActiveOption && 'is-selected'
        ])}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onMouseDown={onStartInteraction}
        onTouchStart={onStartInteraction}
        onClick={onButtonClick}
        ref={button}>

        <span className="dropdown__inner js-dropdown-inner" dangerouslySetInnerHTML={{ __html: displayActiveOption?.text }}>
        </span>

        <span className="dropdown__icon" aria-hidden="true">
          <span className="icon"></span>
        </span>

      </button>

      <ul
        className={classes([
          'dropdown__list js-dropdown-list',
          !isOpen && 'u-display-none',
          isOpen && !isShown && 'u-visibility-hidden'
        ])}
        style={{
          top: (!isShown || !isListOffScreen) ? '' : -listHeight,
          left: buttonOffsetLeft,
          width: buttonWidth
        }}
        role="listbox"
        tabIndex="-1"
        onBlur={onListBlur}
        ref={list}
        disabled={!_isEnabled}
        aria-activedescendant={highlightedOption && `dropdown__item__${_id}__${_itemIndex}__${highlightedOption._index}`}
        aria-labelledby={`${_id}-matching-item-${_itemIndex}__title`}
      >

        {options.map(({
          displayText,
          text,
          _index,
          _isHighlighted
        }) => {
          return <li
            key={_index}
            id={`dropdown__item__${_id}__${_itemIndex}__${_index}`}
            className="dropdown-item js-dropdown-list-item"
            role="option"
            value={_index}
            aria-selected={_isHighlighted || null}
            selected={_isHighlighted || null}
            onClick={onOptionClicked}
          >
            <div className="dropdown-item__inner js-dropdown-list-item-inner u-no-select" dangerouslySetInnerHTML={{ __html: displayText || compile(text) }}>
            </div>
          </li>;
        })}

      </ul>

    </div>
  );

}
