import { getViewIdFromUrl, isViewUrl } from '../url'

beforeEach(() => {
    Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
    })
})

describe('getViewIdFromUrl', () => {
    it('extracts view ID from /views/:id', () => {
        window.location.pathname = '/views/123'

        expect(getViewIdFromUrl()).toBe(123)
    })

    it('extracts view ID from /app/tickets/:id', () => {
        window.location.pathname = '/app/tickets/456'

        expect(getViewIdFromUrl()).toBe(456)
    })

    it('returns null for /views without an ID', () => {
        window.location.pathname = '/views'

        expect(getViewIdFromUrl()).toBeNull()
    })

    it('returns null for unrelated paths', () => {
        window.location.pathname = '/settings/macros'

        expect(getViewIdFromUrl()).toBeNull()
    })

    it('returns null for /views/ with trailing slash only', () => {
        window.location.pathname = '/views/'

        expect(getViewIdFromUrl()).toBeNull()
    })
})

describe('isViewUrl', () => {
    it('returns true for /views paths', () => {
        window.location.pathname = '/views/1'

        expect(isViewUrl()).toBe(true)
    })

    it('returns true for /app/tickets paths', () => {
        window.location.pathname = '/app/tickets/1'

        expect(isViewUrl()).toBe(true)
    })

    it('returns false for non-view paths', () => {
        window.location.pathname = '/settings'

        expect(isViewUrl()).toBe(false)
    })
})
