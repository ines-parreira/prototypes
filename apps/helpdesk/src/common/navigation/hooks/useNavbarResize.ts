import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
    MouseEvent as MouseEventReact,
    RefObject,
    TouchEvent as TouchEventReact,
} from 'react'

import { useSavedSizes } from '@repo/layout'

import { clamp } from 'panels'
import { isTouchEvent } from 'utils'

export const DEFAULT_WIDTH = 238
export const MIN_WIDTH = 200
export const MAX_WIDTH = 350

type State = {
    isResizing: boolean
    width: number
}

export default function useNavbarResize(
    navbarRef: RefObject<HTMLDivElement | null>,
) {
    const [savedSizes, persistSizes] = useSavedSizes()
    const [{ isResizing, width }, setState] = useState<State>({
        isResizing: false,
        width: savedSizes.current.navigation || DEFAULT_WIDTH,
    })

    const handleStartResize = useCallback(
        (event: MouseEventReact | TouchEventReact) => {
            // disable resizing width for right-click event
            if (!isTouchEvent(event) && event.button === 2) {
                return
            }
            setState((s) => ({ ...s, isResizing: true }))
        },
        [],
    )

    const handleResize = useCallback(
        (event: MouseEvent | TouchEvent) => {
            let navbarWidth
            if (isTouchEvent(event)) {
                const touch: Touch = event.touches[0] || event.changedTouches[0]
                navbarWidth = touch.pageX
            } else {
                navbarWidth = event.clientX
            }
            const rect = navbarRef.current?.getBoundingClientRect()
            if (rect) {
                navbarWidth = navbarWidth - rect.left
            }

            const newWidth = clamp(navbarWidth, MIN_WIDTH, MAX_WIDTH)
            setState((s) => ({ ...s, width: newWidth }))
        },
        [navbarRef],
    )

    const handleStopResize = useCallback(() => {
        setState((s) => {
            persistSizes({ navigation: s.width })
            return { ...s, isResizing: false }
        })
    }, [persistSizes])

    useEffect(() => {
        if (!isResizing) return

        window.addEventListener('mousemove', handleResize)
        window.addEventListener('touchmove', handleResize)
        window.addEventListener('mouseup', handleStopResize)
        window.addEventListener('touchend', handleStopResize)

        return () => {
            window.removeEventListener('mousemove', handleResize)
            window.removeEventListener('touchmove', handleResize)
            window.removeEventListener('mouseup', handleStopResize)
            window.removeEventListener('touchend', handleStopResize)
        }
    }, [handleResize, handleStopResize, isResizing])

    return useMemo(
        () => ({
            onStartResize: handleStartResize,
            isResizing,
            width,
        }),
        [handleStartResize, isResizing, width],
    )
}
