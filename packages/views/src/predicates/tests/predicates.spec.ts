import { mockView } from '@gorgias/helpdesk-mocks'

import { DEFAULT_REFRESH_CONFIG } from '../../scheduler/selectViewsToRefresh'
import {
    clearViewsCount,
    expandSection,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import { isViewActive } from '../isViewActive'
import { isViewExpanded } from '../isViewExpanded'
import { isViewLarge } from '../isViewLarge'
import { isViewRecentlyViewed } from '../isViewRecentlyViewed'
import { isViewStale } from '../isViewStale'
import { isViewVisible } from '../isViewVisible'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

beforeEach(() => {
    clearViewsCount()
    Object.defineProperty(window, 'location', {
        value: { pathname: '/views/1' },
        writable: true,
    })
})

describe('isViewActive', () => {
    it('returns true when the view is the active view', () => {
        viewsCountStore.setState({ activeViewId: 42 })

        expect(isViewActive(42)).toBe(true)
    })

    it('returns false when a different view is active', () => {
        viewsCountStore.setState({ activeViewId: 42 })

        expect(isViewActive(99)).toBe(false)
    })

    it('returns false when no view is active', () => {
        expect(isViewActive(1)).toBe(false)
    })
})

describe('isViewExpanded', () => {
    it('returns true when the view has no section_id', () => {
        const view = mockView({ id: 1, section_id: null })

        expect(isViewExpanded(view)).toBe(true)
    })

    it('returns true when the section is expanded', () => {
        expandSection('section-10')
        const view = mockView({ id: 1, section_id: 10 })

        expect(isViewExpanded(view)).toBe(true)
    })

    it('returns true when expandedSectionIds is null (all expanded)', () => {
        viewsCountStore.setState({ expandedSectionIds: undefined })
        const view = mockView({ id: 1, section_id: 10 })

        expect(isViewExpanded(view)).toBe(true)
    })

    it('returns false when the section is not expanded', () => {
        viewsCountStore.setState({ expandedSectionIds: [] })
        const view = mockView({ id: 1, section_id: 10 })

        expect(isViewExpanded(view)).toBe(false)
    })
})

describe('isViewLarge', () => {
    it('returns true when count meets the threshold', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: DEFAULT_REFRESH_CONFIG.largeCountThreshold })

        expect(isViewLarge(view)).toBe(true)
    })

    it('returns true when count exceeds the threshold', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: DEFAULT_REFRESH_CONFIG.largeCountThreshold + 500 })

        expect(isViewLarge(view)).toBe(true)
    })

    it('returns false when count is below the threshold', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: DEFAULT_REFRESH_CONFIG.largeCountThreshold - 1 })

        expect(isViewLarge(view)).toBe(false)
    })

    it('returns false when no count exists', () => {
        const view = mockView({ id: 999 })

        expect(isViewLarge(view)).toBe(false)
    })
})

describe('isViewRecentlyViewed', () => {
    it('returns true when viewed within the active window', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: 10 })
        viewsCountStore.setState((state) => ({
            counts: {
                ...state.counts,
                1: {
                    ...state.counts[1]!,
                    lastViewedAt: new Date().toISOString(),
                },
            },
        }))

        expect(isViewRecentlyViewed(view)).toBe(true)
    })

    it('returns false when viewed outside the active window', () => {
        const view = mockView({ id: 1 })
        const old = new Date(
            Date.now() -
                (DEFAULT_REFRESH_CONFIG.recentlyActiveWindowSeconds + 10) *
                    1000,
        ).toISOString()
        setViewsCount({ 1: 10 })
        viewsCountStore.setState((state) => ({
            counts: {
                ...state.counts,
                1: { ...state.counts[1]!, lastViewedAt: old },
            },
        }))

        expect(isViewRecentlyViewed(view)).toBe(false)
    })

    it('returns false when never viewed', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: 10 })

        expect(isViewRecentlyViewed(view)).toBe(false)
    })

    it('returns false when no entry exists', () => {
        const view = mockView({ id: 999 })

        expect(isViewRecentlyViewed(view)).toBe(false)
    })
})

describe('isViewStale', () => {
    it('returns true when never fetched', () => {
        const view = mockView({ id: 999 })

        expect(isViewStale(view)).toBe(true)
    })

    it('returns true when fetched longer ago than staleSeconds', () => {
        const view = mockView({ id: 1 })
        const old = new Date(
            Date.now() - (DEFAULT_REFRESH_CONFIG.staleSeconds + 10) * 1000,
        ).toISOString()
        setViewsCount({ 1: 10 })
        viewsCountStore.setState((state) => ({
            counts: {
                ...state.counts,
                1: { ...state.counts[1]!, lastFetchedAt: old },
            },
        }))

        expect(isViewStale(view)).toBe(true)
    })

    it('returns false when recently fetched', () => {
        const view = mockView({ id: 1 })
        setViewsCount({ 1: 10 })

        expect(isViewStale(view)).toBe(false)
    })
})

describe('isViewVisible', () => {
    it('returns false when not on a view URL', () => {
        window.location.pathname = '/settings'
        const view = mockView({ id: 1, visibility: 'public' })

        expect(isViewVisible(view)).toBe(false)
    })

    it('returns true when expandedSectionIds is null (all expanded)', () => {
        viewsCountStore.setState({ expandedSectionIds: undefined })
        const view = mockView({ id: 1, visibility: 'public', section_id: 10 })

        expect(isViewVisible(view)).toBe(true)
    })

    it('returns false when the category is collapsed', () => {
        viewsCountStore.setState({ expandedSectionIds: [] })
        const view = mockView({ id: 1, visibility: 'private' })

        expect(isViewVisible(view)).toBe(false)
    })

    it('returns true for a public view when the public category is expanded', () => {
        viewsCountStore.setState({ expandedSectionIds: ['public'] })
        const view = mockView({ id: 1, visibility: 'public', section_id: null })

        expect(isViewVisible(view)).toBe(true)
    })

    it('returns true for a private view when the private category is expanded', () => {
        viewsCountStore.setState({ expandedSectionIds: ['private'] })
        const view = mockView({
            id: 1,
            visibility: 'private',
            section_id: null,
        })

        expect(isViewVisible(view)).toBe(true)
    })

    it('returns true when category and section are both expanded', () => {
        viewsCountStore.setState({
            expandedSectionIds: ['public', 'section-10'],
        })
        const view = mockView({ id: 1, visibility: 'public', section_id: 10 })

        expect(isViewVisible(view)).toBe(true)
    })

    it('returns false when category is expanded but section is collapsed', () => {
        viewsCountStore.setState({ expandedSectionIds: ['public'] })
        const view = mockView({ id: 1, visibility: 'public', section_id: 10 })

        expect(isViewVisible(view)).toBe(false)
    })

    it('treats shared visibility as public category', () => {
        viewsCountStore.setState({ expandedSectionIds: ['public'] })
        const view = mockView({ id: 1, visibility: 'shared', section_id: null })

        expect(isViewVisible(view)).toBe(true)
    })
})
