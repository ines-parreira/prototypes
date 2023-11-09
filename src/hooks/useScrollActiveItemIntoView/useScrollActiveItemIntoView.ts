import {RefObject, useEffect} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import getScrollParent from 'scrollparent'
import _throttle from 'lodash/throttle'

const useScrollActiveItemIntoView = (
    elementRef: RefObject<HTMLElement>,
    isActive: boolean,
    shouldScrollOnScrollParentResize?: boolean
) => {
    useEffect(() => {
        let scrollableParentResizeObserver: ResizeObserver | undefined
        const scroll = () => {
            scrollIntoView(elementRef.current as Element, {
                scrollMode: 'if-needed',
            })
        }

        const throttledScroll = _throttle(scroll, 300)

        if (isActive && elementRef.current) {
            if (shouldScrollOnScrollParentResize) {
                const scrollParent = getScrollParent(elementRef.current)
                scrollableParentResizeObserver = new ResizeObserver(() => {
                    throttledScroll()
                })
                scrollParent &&
                    scrollableParentResizeObserver.observe(scrollParent)
            }

            scroll()
        }

        return () => {
            scrollableParentResizeObserver?.disconnect()
        }
    }, [isActive, elementRef, shouldScrollOnScrollParentResize])
}

export default useScrollActiveItemIntoView
