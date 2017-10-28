// @flow
import {findDOMNode} from 'react-dom'
import _isUndefined from 'lodash/isUndefined'

/**
 * Scroll DOM node into view
 */
function scrollToNode(node: HTMLElement) {
    // $FlowFixMe
    return !_isUndefined(Element.prototype.scrollIntoViewIfNeeded) ? node.scrollIntoViewIfNeeded() : node.scrollIntoView()
}

/**
 * Scroll React component into view
 */
export function scrollToReactNode(node: any) {
    // findDOMNode has a null return type
    // $FlowFixMe
    return scrollToNode(findDOMNode(node))
}

/**
 * Returns the next/previous possible index in a list
 */
type optionsType = {
    direction: 'previous' | 'next',
    rotate?: boolean
}
export function moveIndex(
    currentIndex: number = 0,
    length: number = 0,
    options: optionsType = {
        direction: 'next',
        rotate: false
    }
) {
    const move = (options.direction === 'next') ? 1 : -1
    const newIndex = currentIndex + move
    const atStart = (newIndex < 0)
    const atEnd = (newIndex >= length)

    if (options.rotate) {
        if (atStart) {
            return length - 1
        } else if (atEnd) {
            return 0
        }
    }

    if (atStart || atEnd) {
        return currentIndex
    }

    return newIndex
}

