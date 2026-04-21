import { useCallback, useEffect, useRef } from 'react'

import {
    addViewportViewId,
    removeViewportViewId,
} from '../store/viewsCountStore'

const elementToViewId = new Map<Element, number>()

let sharedObserver: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
    if (!sharedObserver) {
        sharedObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const viewId = elementToViewId.get(entry.target)
                    if (viewId === undefined) continue
                    if (entry.isIntersecting) {
                        addViewportViewId(viewId)
                    } else {
                        removeViewportViewId(viewId)
                    }
                }
            },
            { threshold: 0 },
        )
    }
    return sharedObserver
}

export function useTrackViewInViewport(
    viewId: number,
): (node: HTMLElement | null) => void {
    const prevElementRef = useRef<HTMLElement | null>(null)

    const ref = useCallback(
        (node: HTMLElement | null) => {
            const observer = getObserver()

            if (prevElementRef.current) {
                observer.unobserve(prevElementRef.current)
                elementToViewId.delete(prevElementRef.current)
            }

            prevElementRef.current = node

            if (node) {
                elementToViewId.set(node, viewId)
                observer.observe(node)
            }
        },
        [viewId],
    )

    useEffect(() => {
        return () => {
            if (prevElementRef.current) {
                getObserver().unobserve(prevElementRef.current)
                elementToViewId.delete(prevElementRef.current)
                prevElementRef.current = null
            }
            removeViewportViewId(viewId)
        }
    }, [viewId])

    return ref
}
