import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { isEqual } from '@gorgias/toolkit'

const VIEW_LINK_SELECTOR = '[id^="view-"]'
const VIEW_LINK_ID_PATTERN = /^view-(\d+)$/

export function useVisibleNavigationViewIds(
    rootRef: RefObject<HTMLElement | null>,
): number[] {
    const [visibleViewIds, setVisibleViewIds] = useState<number[]>([])

    useEffect(() => {
        const rootElement = rootRef.current

        if (
            !rootElement ||
            typeof IntersectionObserver === 'undefined' ||
            typeof MutationObserver === 'undefined'
        ) {
            setVisibleViewIds([])
            return
        }

        const navigationRoot: HTMLElement = rootElement
        const observedElements = new Map<
            Element,
            { isVisible: boolean; viewId: number }
        >()
        let isActive = true
        let scheduledAnimationFrameId: number | null = null

        function getViewId(element: Element): number | null {
            const id = element.getAttribute('id')
            const match = id?.match(VIEW_LINK_ID_PATTERN)

            return match ? Number(match[1]) : null
        }

        function flushVisibleViewIds(): void {
            scheduledAnimationFrameId = null
            if (!isActive) return

            const nextVisibleViewIds = Array.from(
                navigationRoot.querySelectorAll(VIEW_LINK_SELECTOR),
            ).flatMap((element) => {
                const view = observedElements.get(element)

                return view?.isVisible ? [view.viewId] : []
            })

            setVisibleViewIds((currentVisibleViewIds) =>
                isEqual(currentVisibleViewIds, nextVisibleViewIds)
                    ? currentVisibleViewIds
                    : nextVisibleViewIds,
            )
        }

        function scheduleFlush(): void {
            if (scheduledAnimationFrameId !== null) return

            scheduledAnimationFrameId =
                requestAnimationFrame(flushVisibleViewIds)
        }

        const intersectionObserver = new IntersectionObserver((entries) => {
            let hasChanged = false

            for (const entry of entries) {
                const observedElement = observedElements.get(entry.target)

                if (!observedElement) continue

                if (observedElement.isVisible !== entry.isIntersecting) {
                    observedElement.isVisible = entry.isIntersecting
                    hasChanged = true
                }
            }

            if (hasChanged) scheduleFlush()
        })

        function syncObservedElements(): void {
            const nextElements = new Set(
                navigationRoot.querySelectorAll(VIEW_LINK_SELECTOR),
            )

            for (const [element] of observedElements) {
                if (nextElements.has(element)) continue

                intersectionObserver.unobserve(element)
                observedElements.delete(element)
            }

            for (const element of nextElements) {
                if (observedElements.has(element)) continue

                const viewId = getViewId(element)

                if (viewId === null) continue

                observedElements.set(element, { isVisible: false, viewId })
                intersectionObserver.observe(element)
            }

            scheduleFlush()
        }

        const mutationObserver = new MutationObserver(syncObservedElements)
        mutationObserver.observe(navigationRoot, {
            childList: true,
            subtree: true,
        })

        syncObservedElements()

        return () => {
            isActive = false
            if (scheduledAnimationFrameId !== null) {
                cancelAnimationFrame(scheduledAnimationFrameId)
            }
            mutationObserver.disconnect()
            intersectionObserver.disconnect()
        }
    }, [rootRef])

    return visibleViewIds
}
