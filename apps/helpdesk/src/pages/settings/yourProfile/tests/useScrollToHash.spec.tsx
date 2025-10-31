import { renderHook } from '@repo/testing'
import { MemoryRouter } from 'react-router-dom'

import { useScrollToHash } from '../hooks/useScrollToHash'

describe('useScrollToHash', () => {
    beforeEach(() => {
        const element = document.createElement('div')
        element.id = 'test-section'
        element.scrollIntoView = jest.fn()
        document.body.appendChild(element)
    })

    afterEach(() => {
        document.body.innerHTML = ''
        jest.clearAllMocks()
    })

    it('should scroll to element when hash is present', () => {
        const element = document.getElementById('test-section')

        renderHook(() => useScrollToHash(), {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={['/page#test-section']}>
                    {children}
                </MemoryRouter>
            ),
        })

        expect(element?.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
        })
    })

    it('should not scroll when no hash is present', () => {
        const element = document.getElementById('test-section')

        renderHook(() => useScrollToHash(), {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={['/page']}>
                    {children}
                </MemoryRouter>
            ),
        })

        expect(element?.scrollIntoView).not.toHaveBeenCalled()
    })

    it('should not throw when element does not exist', () => {
        expect(() => {
            renderHook(() => useScrollToHash(), {
                wrapper: ({ children }) => (
                    <MemoryRouter initialEntries={['/page#nonexistent']}>
                        {children}
                    </MemoryRouter>
                ),
            })
        }).not.toThrow()
    })
})
