import { useRef } from 'react'

import { render } from '@repo/testing/vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { useVisibleNavigationViewIds } from '../useVisibleNavigationViewIds'

class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds = []
    readonly observedElements = new Set<Element>()

    constructor(private readonly callback: IntersectionObserverCallback) {
        intersectionObservers.push(this)
    }

    disconnect(): void {
        this.observedElements.clear()
    }

    observe(element: Element): void {
        this.observedElements.add(element)
    }

    takeRecords(): IntersectionObserverEntry[] {
        return []
    }

    unobserve(element: Element): void {
        this.observedElements.delete(element)
    }

    trigger(element: Element, isIntersecting: boolean): void {
        this.callback(
            [
                {
                    isIntersecting,
                    target: element,
                } as IntersectionObserverEntry,
            ],
            this,
        )
    }
}

let intersectionObservers: MockIntersectionObserver[] = []

function TicketViewsNavigation({ viewIds }: { viewIds: number[] }) {
    const rootRef = useRef<HTMLElement>(null)
    const visibleViewIds = useVisibleNavigationViewIds(rootRef)

    return (
        <>
            <nav aria-label="Ticket views" ref={rootRef}>
                {viewIds.map((viewId) => (
                    <a
                        href={`/app/views/${viewId}`}
                        id={`view-${viewId}`}
                        key={viewId}
                    >
                        View {viewId}
                    </a>
                ))}
                <a href="/app/views/draft" id="view-draft">
                    Draft view
                </a>
            </nav>
            <output aria-label="Visible view ids">
                {visibleViewIds.join(',')}
            </output>
        </>
    )
}

function triggerIntersection(element: Element, isIntersecting: boolean): void {
    act(() => {
        for (const observer of intersectionObservers) {
            if (observer.observedElements.has(element)) {
                observer.trigger(element, isIntersecting)
            }
        }
    })
}

beforeEach(() => {
    intersectionObservers = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('useVisibleNavigationViewIds', () => {
    it('returns an empty list when observers cannot be attached', () => {
        vi.stubGlobal('IntersectionObserver', undefined)

        render(<TicketViewsNavigation viewIds={[1]} />)

        expect(screen.getByLabelText('Visible view ids')).toHaveTextContent('')
        expect(intersectionObservers).toEqual([])
    })

    it('returns intersecting view IDs in navigation order', async () => {
        render(<TicketViewsNavigation viewIds={[1, 2]} />)

        const firstView = screen.getByRole('link', { name: 'View 1' })
        const secondView = screen.getByRole('link', { name: 'View 2' })

        await waitFor(() => {
            expect(intersectionObservers[0].observedElements).toContain(
                firstView,
            )
            expect(intersectionObservers[0].observedElements).toContain(
                secondView,
            )
        })

        triggerIntersection(secondView, true)
        triggerIntersection(firstView, true)

        await waitFor(() => {
            expect(screen.getByLabelText('Visible view ids')).toHaveTextContent(
                '1,2',
            )
        })

        triggerIntersection(firstView, false)

        await waitFor(() => {
            expect(screen.getByLabelText('Visible view ids')).toHaveTextContent(
                '2',
            )
        })
    })

    it('observes view links added after the hook mounts', async () => {
        const { rerender } = render(<TicketViewsNavigation viewIds={[1]} />)

        const firstView = screen.getByRole('link', { name: 'View 1' })
        triggerIntersection(firstView, true)

        await waitFor(() => {
            expect(screen.getByLabelText('Visible view ids')).toHaveTextContent(
                '1',
            )
        })

        rerender(<TicketViewsNavigation viewIds={[1, 3]} />)

        const thirdView = screen.getByRole('link', { name: 'View 3' })

        await waitFor(() => {
            expect(intersectionObservers[0].observedElements).toContain(
                thirdView,
            )
        })

        triggerIntersection(thirdView, true)

        await waitFor(() => {
            expect(screen.getByLabelText('Visible view ids')).toHaveTextContent(
                '1,3',
            )
        })
    })

    it('ignores unchanged visibility updates', async () => {
        render(<TicketViewsNavigation viewIds={[1]} />)

        const firstView = screen.getByRole('link', { name: 'View 1' })
        triggerIntersection(firstView, true)

        await waitFor(() => {
            expect(screen.getByLabelText('Visible view ids')).toHaveTextContent(
                '1',
            )
        })

        triggerIntersection(firstView, true)

        expect(screen.getByLabelText('Visible view ids')).toHaveTextContent('1')
    })
})
