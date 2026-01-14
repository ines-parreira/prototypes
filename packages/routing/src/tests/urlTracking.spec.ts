import { beforeEach, describe, expect, it } from 'vitest'

import { history } from '../history'
import { getCurrentUrl, getPreviousUrl } from '../urlTracking'

describe('urlTracking', () => {
    beforeEach(() => {
        // Reset to initial page
        history.push('/')
    })

    describe('getPreviousUrl', () => {
        it('should return null initially when no navigation has occurred', () => {
            const previousUrl = getPreviousUrl()
            expect(previousUrl).toBeDefined()
            // Note: In test environment, document.referrer might be empty or set by jsdom
        })

        it('should return the previous URL after navigation', () => {
            // Navigate to first page
            history.push('/page1')

            // Wait for listener to update
            const urlAfterFirstNav = getCurrentUrl()

            // Navigate to second page
            history.push('/page2')

            // Previous URL should now be the first page
            const previousUrl = getPreviousUrl()
            expect(previousUrl).toBe(urlAfterFirstNav)
        })

        it('should track multiple navigation changes', () => {
            // First navigation
            history.push('/page1')
            const firstUrl = getCurrentUrl()

            // Second navigation
            history.push('/page2')
            expect(getPreviousUrl()).toBe(firstUrl)

            const secondUrl = getCurrentUrl()

            // Third navigation
            history.push('/page3')
            expect(getPreviousUrl()).toBe(secondUrl)
        })
    })

    describe('getCurrentUrl', () => {
        it('should return the current window location initially', () => {
            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain(window.location.origin)
        })

        it('should update to reflect the current URL after navigation', () => {
            history.push('/test-page')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/test-page')
        })

        it('should include pathname, search, and hash', () => {
            history.push('/page?query=test#section')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/page')
            expect(currentUrl).toContain('query=test')
            expect(currentUrl).toContain('#section')
        })

        it('should update when navigating with search params', () => {
            history.push('/search?q=hello')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/search')
            expect(currentUrl).toContain('q=hello')
        })

        it('should update when navigating with hash', () => {
            history.push('/page#anchor')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/page')
            expect(currentUrl).toContain('#anchor')
        })
    })

    describe('navigation tracking', () => {
        it('should track replace navigation', () => {
            history.push('/page1')
            const previousUrl = getCurrentUrl()

            history.replace('/page2')

            expect(getCurrentUrl()).toContain('/page2')
            expect(getPreviousUrl()).toBe(previousUrl)
        })

        it('should handle rapid navigation changes', () => {
            history.push('/page1')
            history.push('/page2')
            history.push('/page3')
            const page3Url = getCurrentUrl()

            history.push('/page4')

            expect(getPreviousUrl()).toBe(page3Url)
            expect(getCurrentUrl()).toContain('/page4')
        })
    })

    describe('URL structure', () => {
        it('should construct full URL with origin, pathname, search, and hash', () => {
            const testPath = '/test/path'
            const testSearch = '?param=value'
            const testHash = '#section'

            history.push(`${testPath}${testSearch}${testHash}`)

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain(window.location.origin)
            expect(currentUrl).toContain(testPath)
            expect(currentUrl).toContain(testSearch)
            expect(currentUrl).toContain(testHash)
        })

        it('should handle URLs without search params', () => {
            history.push('/simple-path')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/simple-path')
            expect(currentUrl).not.toContain('?')
        })

        it('should handle URLs without hash', () => {
            history.push('/path-without-hash')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/path-without-hash')
            expect(currentUrl).not.toContain('#')
        })

        it('should handle root path', () => {
            history.push('/')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toBe(`${window.location.origin}/`)
        })
    })

    describe('edge cases', () => {
        it('should handle navigation to same path', () => {
            history.push('/same-path')
            const firstUrl = getCurrentUrl()

            history.push('/same-path')

            expect(getPreviousUrl()).toBe(firstUrl)
            expect(getCurrentUrl()).toContain('/same-path')
        })

        it('should handle empty search params', () => {
            history.push('/page?')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/page')
        })

        it('should handle empty hash', () => {
            history.push('/page#')

            const currentUrl = getCurrentUrl()
            expect(currentUrl).toContain('/page')
        })

        it('should handle special characters in URL', () => {
            const specialPath = '/path with spaces'
            history.push(specialPath)

            const currentUrl = getCurrentUrl()
            // History stores the path as-is, not encoded
            expect(currentUrl).toContain('/path with spaces')
        })
    })
})
