import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

type UseRenderingBehaviourParams = {
    hasAgents: boolean
    height: number
    rootRef: RefObject<HTMLElement | null>
}

export function useRenderingBehaviour({
    hasAgents,
    height,
    rootRef,
}: UseRenderingBehaviourParams) {
    const [shouldReserveSpace, setShouldReserveSpace] = useState(true)
    const shouldReserveSpaceRef = useRef(true)

    useEffect(() => {
        if (!hasAgents) {
            return
        }

        const scrollContainer = rootRef.current?.nextElementSibling

        if (!(scrollContainer instanceof HTMLElement)) {
            return
        }

        const handleScroll = () => {
            if (
                shouldReserveSpaceRef.current &&
                scrollContainer.scrollTop >= height
            ) {
                // once the banner height has been fully scrolled through, we
                // stop reserving vertical space and compensate the scroll
                // position so the visible content does not jump.
                shouldReserveSpaceRef.current = false
                scrollContainer.scrollTop = scrollContainer.scrollTop - height
                setShouldReserveSpace(false)
                return
            }

            if (
                !shouldReserveSpaceRef.current &&
                scrollContainer.scrollTop <= 0
            ) {
                // when the user scrolls back to the top, restore the reserved
                // banner space so the activity row can animate back in.
                shouldReserveSpaceRef.current = true
                setShouldReserveSpace(true)
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll, {
            passive: true,
        })

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll)
        }
    }, [hasAgents, height, rootRef])

    useLayoutEffect(() => {
        const scrollContainer = rootRef.current?.nextElementSibling

        if (!(scrollContainer instanceof HTMLElement) || !hasAgents) {
            return
        }

        // sync the initial reserved-space state with the current scroll
        // position so the banner does not flash into the wrong state on mount.
        const nextShouldReserveSpace = scrollContainer.scrollTop <= 0

        shouldReserveSpaceRef.current = nextShouldReserveSpace
        setShouldReserveSpace(nextShouldReserveSpace)
    }, [hasAgents, rootRef])

    useEffect(() => {
        if (!hasAgents) {
            // Reset to the default banner-ready state once the activity is gone
            // so the next appearance behaves like a fresh mount.
            shouldReserveSpaceRef.current = true
            setShouldReserveSpace(true)
        }
    }, [hasAgents])

    return {
        shouldReserveSpace,
    }
}
