import {findDOMNode} from 'react-dom'
import scrollIntoView from 'scroll-into-view-if-needed'
import {Component} from 'react'

/**
 * Scroll DOM node into view
 */
function scrollToNode(node: HTMLElement) {
    return scrollIntoView(node, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
    })
}

/**
 * Scroll React component into view
 */
export function scrollToReactNode(node: HTMLElement | Component) {
    return scrollToNode(findDOMNode(node) as HTMLElement)
}

export enum MoveIndexDirection {
    Next = 'next',
    Prev = 'prev',
}

type MoveIndexOptions = {
    direction: MoveIndexDirection
    rotate?: boolean
}

/**
 * Returns the next/previous possible index in a list
 */
export function moveIndex(
    currentIndex = 0,
    length = 0,
    options: MoveIndexOptions = {
        direction: MoveIndexDirection.Next,
        rotate: false,
    }
) {
    const move = options.direction === 'next' ? 1 : -1
    const newIndex = currentIndex + move
    const atStart = newIndex < 0
    const atEnd = newIndex >= length

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
