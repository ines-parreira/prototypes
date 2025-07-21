import { Component } from 'react'

import { findDOMNode } from 'react-dom'
import scrollIntoView, {
    StandardBehaviorOptions,
} from 'scroll-into-view-if-needed'

/**
 * Scroll DOM node into view
 */
function scrollToNode(node: Element, options?: StandardBehaviorOptions) {
    return scrollIntoView(node, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
        ...options,
    })
}

/**
 * Scroll React component into view
 */
export function scrollToReactNode(
    node: HTMLElement | Component,
    options?: StandardBehaviorOptions,
) {
    const domNode = findDOMNode(node)
    if (!domNode || domNode instanceof Text) {
        return
    }
    return scrollToNode(domNode, options)
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
    },
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
