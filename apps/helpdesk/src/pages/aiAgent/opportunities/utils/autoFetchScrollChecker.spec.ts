import {
    checkAndTriggerAutoFetch,
    shouldAutoFetchMoreItems,
} from './autoFetchScrollChecker'

describe('shouldAutoFetchMoreItems', () => {
    it('should return false when container is null', () => {
        const result = shouldAutoFetchMoreItems(null, 144)

        expect(result).toBe(false)
    })

    it('should return false when scroller element is not found', () => {
        const mockContainer = document.createElement('div')

        const result = shouldAutoFetchMoreItems(mockContainer, 144)

        expect(result).toBe(false)
    })

    it('should return true when scrollable distance is less than threshold', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 200,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144
        const result = shouldAutoFetchMoreItems(mockContainer, threshold)

        expect(result).toBe(true)
    })

    it('should return false when scrollable distance equals threshold', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 294,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144
        const result = shouldAutoFetchMoreItems(mockContainer, threshold)

        expect(result).toBe(false)
    })

    it('should return false when scrollable distance is greater than threshold', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 500,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144
        const result = shouldAutoFetchMoreItems(mockContainer, threshold)

        expect(result).toBe(false)
    })

    it('should return true when content is not scrollable at all', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 100,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 500,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144
        const result = shouldAutoFetchMoreItems(mockContainer, threshold)

        expect(result).toBe(true)
    })

    it('should handle edge case with zero scrollable distance', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 150,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144
        const result = shouldAutoFetchMoreItems(mockContainer, threshold)

        expect(result).toBe(true)
    })

    it('should work with different threshold values', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 300,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 200,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        expect(shouldAutoFetchMoreItems(mockContainer, 50)).toBe(false)
        expect(shouldAutoFetchMoreItems(mockContainer, 100)).toBe(false)
        expect(shouldAutoFetchMoreItems(mockContainer, 101)).toBe(true)
        expect(shouldAutoFetchMoreItems(mockContainer, 200)).toBe(true)
    })
})

describe('checkAndTriggerAutoFetch', () => {
    it('should call onEndReached when shouldFetch is true and all conditions are met', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 200,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            true,
            false,
            mockOnEndReached,
        )

        expect(mockOnEndReached).toHaveBeenCalledTimes(1)
    })

    it('should not call onEndReached when hasNextPage is false', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 200,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            false,
            false,
            mockOnEndReached,
        )

        expect(mockOnEndReached).not.toHaveBeenCalled()
    })

    it('should not call onEndReached when isFetchingNextPage is true', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 200,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            true,
            true,
            mockOnEndReached,
        )

        expect(mockOnEndReached).not.toHaveBeenCalled()
    })

    it('should not call onEndReached when onEndReached is undefined', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 200,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const threshold = 144

        expect(() => {
            checkAndTriggerAutoFetch(
                mockContainer,
                threshold,
                true,
                false,
                undefined,
            )
        }).not.toThrow()
    })

    it('should not call onEndReached when container is null', () => {
        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(null, threshold, true, false, mockOnEndReached)

        expect(mockOnEndReached).not.toHaveBeenCalled()
    })

    it('should not call onEndReached when scroller element is not found', () => {
        const mockContainer = document.createElement('div')
        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            true,
            false,
            mockOnEndReached,
        )

        expect(mockOnEndReached).not.toHaveBeenCalled()
    })

    it('should not call onEndReached when shouldFetch is false (scrollable distance >= threshold)', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 500,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 150,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            true,
            false,
            mockOnEndReached,
        )

        expect(mockOnEndReached).not.toHaveBeenCalled()
    })

    it('should handle all conditions being true together', () => {
        const mockScroller = document.createElement('div')
        Object.defineProperty(mockScroller, 'scrollHeight', {
            value: 100,
            configurable: true,
        })
        Object.defineProperty(mockScroller, 'clientHeight', {
            value: 500,
            configurable: true,
        })
        mockScroller.setAttribute('data-virtuoso-scroller', '')

        const mockContainer = document.createElement('div')
        mockContainer.appendChild(mockScroller)

        const mockOnEndReached = jest.fn()
        const threshold = 144

        checkAndTriggerAutoFetch(
            mockContainer,
            threshold,
            true,
            false,
            mockOnEndReached,
        )

        expect(mockOnEndReached).toHaveBeenCalledTimes(1)
    })
})
