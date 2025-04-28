import scrollIntoView from 'scroll-into-view-if-needed'

import { renderHook } from 'utils/testing/renderHook'

import useScrollActiveItemIntoView from '../useScrollActiveItemIntoView'

const mockScrollIntoView = jest.fn()

jest.mock('scroll-into-view-if-needed')

const MockResizeObserver = (fn: () => void) => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        observe: (_: HTMLElement) => {
            fn()
        },
        disconnect: jest.fn(),
    }
}

describe('useScrollActiveItemIntoView', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'ResizeObserver', {
            value: MockResizeObserver,
        })
    })
    beforeEach(() => {
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
