import type { RefObject } from 'react'
import { useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import getScrollParent from 'scrollparent'
import { Duration, throttle } from '@gorgias/toolkit'

const useScrollActiveItemIntoView = (
    elementRef: RefObject<HTMLElement>,
    isActive: boolean,
    shouldScrollOnScrollParentResize?: boolean,
) => {
    useEffect(() => {
        let scrollableParentResizeObserver: ResizeObserver | undefined
        const scroll = (ref: HTMLElement) => {
            scrollIntoView(ref, {
                scrollMode: 'if-needed',
            })
        }

        const throttledScroll = throttle(scroll, Duration.millis(300))
        const elementRefCurrent = elementRef.current

        if (isActive && elementRefCurrent) {
            if (shouldScrollOnScrollParentResize) {
                const scrollParent = getScrollParent(elementRefCurrent)
                scrollableParentResizeObserver = new ResizeObserver(() => {
                    throttledScroll(elementRefCurrent)
                })
                scrollParent &&
                    scrollableParentResizeObserver.observe(scrollParent)
            }

            scroll(elementRefCurrent)
        }

        return () => {
            scrollableParentResizeObserver?.disconnect()
        }
    }, [isActive, elementRef, shouldScrollOnScrollParentResize])
}

export { useScrollActiveItemIntoView }
