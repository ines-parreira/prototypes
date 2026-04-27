import { renderHook } from '@repo/testing'

import { useScrollToHash } from '../hooks/useScrollToHash'

describe('useScrollToHash', () => {
    let element: HTMLDivElement

    beforeEach(() => {
        element = document.createElement('div')
        element.id = 'test-section'
        element.scrollIntoView = jest.fn()
        document.body.appendChild(element)
    })

    afterEach(() => {
        element.remove()
        jest.clearAllMocks()
    })

    it('should scroll to element when hash is present', () => {
        const element = document.getElementById('test-section')

        renderHook(() => useScrollToHash(), {
            initialEntries: ['/page#test-section'],
        })

        expect(element?.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
        })
    })

    it('should not scroll when no hash is present', () => {
        const element = document.getElementById('test-section')

        renderHook(() => useScrollToHash(), {
            initialEntries: ['/page'],
        })

        expect(element?.scrollIntoView).not.toHaveBeenCalled()
    })

    it('should not throw when element does not exist', () => {
        expect(() => {
            renderHook(() => useScrollToHash(), {
                initialEntries: ['/page#nonexistent'],
            })
        }).not.toThrow()
    })
})
