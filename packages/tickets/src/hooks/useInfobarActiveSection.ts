import { useEffect, useRef } from 'react'

type Options = {
    sectionIds: readonly string[]
    onChange?: (sectionId: string) => void
    enabled?: boolean
}

function getScrollParent(element: Element): Element | null {
    let parent = element.parentElement
    while (parent) {
        const { overflowY } = getComputedStyle(parent)
        if (overflowY === 'auto' || overflowY === 'scroll') {
            return parent
        }
        parent = parent.parentElement
    }
    return null
}

export function useInfobarActiveSection({
    sectionIds,
    onChange,
    enabled = true,
}: Options) {
    const onChangeRef = useRef(onChange)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        if (!enabled || sectionIds.length === 0) {
            return
        }

        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null)

        if (elements.length === 0) {
            return
        }

        const container = getScrollParent(elements[0])
        if (!container) {
            return
        }

        const scrollMarginTop =
            parseFloat(getComputedStyle(elements[0]).scrollMarginTop) || 0

        let lastReportedSectionId: string | null = null
        let rafId: number | null = null

        const compute = () => {
            const isAtBottom =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 1

            let activeId: string
            if (isAtBottom) {
                activeId = elements[elements.length - 1].id
            } else {
                const triggerY =
                    container.getBoundingClientRect().top + scrollMarginTop + 1
                activeId = elements[0].id
                for (const el of elements) {
                    if (el.getBoundingClientRect().top <= triggerY) {
                        activeId = el.id
                    } else {
                        break
                    }
                }
            }

            if (activeId !== lastReportedSectionId) {
                lastReportedSectionId = activeId
                onChangeRef.current?.(activeId)
            }
        }

        const requestRecompute = () => {
            if (rafId != null) {
                return
            }
            rafId = requestAnimationFrame(() => {
                rafId = null
                compute()
            })
        }

        container.addEventListener('scroll', requestRecompute, {
            passive: true,
        })

        const resizeObserver = new ResizeObserver(requestRecompute)
        resizeObserver.observe(container)
        for (const el of elements) {
            resizeObserver.observe(el)
        }

        compute()

        return () => {
            if (rafId != null) {
                cancelAnimationFrame(rafId)
            }
            container.removeEventListener('scroll', requestRecompute)
            resizeObserver.disconnect()
        }
    }, [enabled, sectionIds])
}
