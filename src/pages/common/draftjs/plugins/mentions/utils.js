import _deburr from 'lodash/deburr'

/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

export const decodeOffsetKey = (offsetKey) => {
    const [blockKey, decoratorKey, leafKey] = offsetKey.split('-')
    return {
        blockKey,
        decoratorKey: parseInt(decoratorKey, 10),
        leafKey: parseInt(leafKey, 10),
    }
}

// Get the first 5 suggestions that match
export const defaultSuggestionsFilter = (searchValue, suggestions) => {
    const value = _deburr(searchValue.toLowerCase())
    const filteredSuggestions = suggestions.filter(
        (suggestion) =>
            !value ||
            _deburr(suggestion.get('name').toLowerCase()).indexOf(value) > -1
    )
    const size = filteredSuggestions.size < 5 ? filteredSuggestions.size : 5
    return filteredSuggestions.setSize(size)
}

export const getWordAt = (string, position) => {
    // Perform type conversions.
    const str = String(string)
    // eslint-disable-next-line no-bitwise
    const pos = Number(position) >>> 0

    // Search for the word's beginning and end.
    const left = str.slice(0, pos + 1).search(/\S+$/)
    const right = str.slice(pos).search(/\s/)

    // The last word in the string is a special case.
    if (right < 0) {
        return {
            word: str.slice(left),
            begin: left,
            end: str.length,
        }
    }

    // Return the word, using the located bounds to extract it from the string.
    return {
        word: str.slice(left, right + pos),
        begin: left,
        end: right + pos,
    }
}

export const getSearchText = (editorState, selection) => {
    const anchorKey = selection.getAnchorKey()
    const anchorOffset = selection.getAnchorOffset() - 1
    const currentContent = editorState.getCurrentContent()
    const currentBlock = currentContent.getBlockForKey(anchorKey)
    const blockText = currentBlock.getText()
    return getWordAt(blockText, anchorOffset)
}

export const getTypeByTrigger = (trigger) =>
    trigger === '@' ? 'mention' : `${trigger}mention`

export const getRelativeParent = (element) => {
    if (!element) {
        return null
    }

    const position = window
        .getComputedStyle(element)
        .getPropertyValue('position')
    if (position !== 'static') {
        return element
    }

    return getRelativeParent(element.parentElement)
}

export const positionSuggestions = ({decoratorRect, popover, state, props}) => {
    const relativeParent = getRelativeParent(popover.parentElement)
    const relativeRect = {}

    if (relativeParent) {
        relativeRect.scrollLeft = relativeParent.scrollLeft
        relativeRect.scrollTop = relativeParent.scrollTop

        const relativeParentRect = relativeParent.getBoundingClientRect()
        relativeRect.left = decoratorRect.left - relativeParentRect.left
        relativeRect.top = decoratorRect.top - relativeParentRect.top
    } else {
        relativeRect.scrollTop =
            window.pageYOffset || document.documentElement.scrollTop
        relativeRect.scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft

        relativeRect.top = decoratorRect.top
        relativeRect.left = decoratorRect.left
    }

    const left = relativeRect.left + relativeRect.scrollLeft
    const top = relativeRect.top + relativeRect.scrollTop

    let transform
    if (state.isActive) {
        if (props.suggestions.size > 0) {
            transform = 'scale(1)'
        }
    }

    return {
        left: `${left}px`,
        top: `${top}px`,
        transform,
    }
}
