import { renderHook } from '@repo/testing'
import scrollIntoView from 'scroll-into-view-if-needed'

import useScrollActiveItemIntoView from '../useScrollActiveItemIntoView'

const mockScrollIntoView = jest.fn()

jest.mock('scroll-into-view-if-needed')

class MockResizeObserver {
    constructor(private fn: () => void) {}

    observe(__: HTMLElement) {
        this.fn()
    }

    disconnect = jest.fn()
}

describe('useScrollActiveItemIntoView', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'ResizeObserver', {
            value: MockResizeObserver,
        })
    })
    beforeEach(() => {
        mockScrollIntoView.mockClear()
        ;(scrollIntoView as jest.Mock).mockImplementation(mockScrollIntoView)
    })

    it('should not scroll if ref is not defined', () => {
        renderHook(() => useScrollActiveItemIntoView({ current: null }, true))

        expect(mockScrollIntoView).not.toHaveBeenCalled()
    })

    it('should not scroll if element is not active', () => {
        const elementRef = { current: document.createElement('div') }

        renderHook(() => useScrollActiveItemIntoView(elementRef, false))

        expect(mockScrollIntoView).not.toHaveBeenCalled()
    })

    it('should scroll if element is active', () => {
        const elementRef = { current: document.createElement('div') }

        renderHook(() => useScrollActiveItemIntoView(elementRef, true))

        expect(mockScrollIntoView).toHaveBeenCalled()
    })

    it('should observe scroll parent resize', () => {
        const mockElement = document.createElement('div')
        const mockScrollParent = document.createElement('div')
        Object.defineProperty(mockElement, 'parentNode', {
            value: mockScrollParent,
            writable: true,
        })
        const elementRef = { current: mockElement }

        renderHook(() => useScrollActiveItemIntoView(elementRef, true, true))

        expect(mockScrollIntoView).toHaveBeenCalledTimes(2)
    })
})
