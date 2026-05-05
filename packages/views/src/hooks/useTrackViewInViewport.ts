import { useCallback, useEffect, useRef } from 'react'

import { setViewportViewIds } from '../store/viewsCountStore'

const elementToViewId = new Map<Element, number>()

type ViewportTracker = {
    observer: IntersectionObserver
    untrack: (viewId: number) => void
}

let tracker: ViewportTracker | null = null

function getTracker(): ViewportTracker {
    if (tracker) return tracker

    const inViewport = new Set<number>()
    let scheduled = false

    function flush(): void {
        scheduled = false
        setViewportViewIds(Array.from(inViewport))
    }

    function schedule(): void {
        if (scheduled) return
        scheduled = true
        queueMicrotask(flush)
    }

    const observer = new IntersectionObserver(
        (entries) => {
            let changed = false
            for (const entry of entries) {
                const viewId = elementToViewId.get(entry.target)
                if (viewId === undefined) continue
                if (entry.isIntersecting) {
                    if (!inViewport.has(viewId)) {
                        inViewport.add(viewId)
                        changed = true
                    }
                } else if (inViewport.delete(viewId)) {
                    changed = true
                }
            }
            if (changed) schedule()
        },
        { threshold: 0 },
    )

    tracker = {
        observer,
        untrack: (viewId) => {
            if (inViewport.delete(viewId)) schedule()
        },
    }
    return tracker
}

export function useTrackViewInViewport(
    viewId: number,
): (node: HTMLElement | null) => void {
    const prevElementRef = useRef<HTMLElement | null>(null)

    const ref = useCallback(
        (node: HTMLElement | null) => {
            const { observer } = getTracker()

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
            const { observer, untrack } = getTracker()
            if (prevElementRef.current) {
                observer.unobserve(prevElementRef.current)
                elementToViewId.delete(prevElementRef.current)
                prevElementRef.current = null
            }
            untrack(viewId)
        }
    }, [viewId])

    return ref
}
