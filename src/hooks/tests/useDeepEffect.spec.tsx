import { act, renderHook } from '@testing-library/react-hooks'

import useDeepEffect from '../useDeepEffect'

// Mock callback function for testing
const mockCallback = jest.fn()

describe('useDeepEffect', () => {
    beforeEach(() => {
        mockCallback.mockClear() // Clear mock before each test
    })

    it('runs effect on initial render', () => {
        const campaign = { id: 1, name: 'Campaign 1' }

        renderHook(() => useDeepEffect(mockCallback, [campaign]))

        // Verify that the effect runs on the initial render
        expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('runs effect when dependencies change', () => {
        const initialCampaign = { id: 1, name: 'Campaign 1' }
        const updatedCampaign = { id: 2, name: 'Campaign 2' }

        const { rerender } = renderHook(
            ({ campaign }) => useDeepEffect(mockCallback, [campaign]),
            {
                initialProps: { campaign: initialCampaign },
            },
        )

        // Effect runs once on initial render
        expect(mockCallback).toHaveBeenCalledTimes(1)

        // Rerender with updated campaign
        act(() => {
            rerender({ campaign: updatedCampaign })
        })

        // Effect should run again due to dependency change
        expect(mockCallback).toHaveBeenCalledTimes(2)
    })

    it('does not run effect when dependencies do not change', () => {
        const campaign = { id: 1, name: 'Campaign 1' }

        const { rerender } = renderHook(
            ({ campaign }) => useDeepEffect(mockCallback, [campaign]),
            {
                initialProps: { campaign },
            },
        )

        // Effect runs once on initial render
        expect(mockCallback).toHaveBeenCalledTimes(1)

        // Rerender with the same campaign object
        act(() => {
            rerender({ campaign })
        })

        // Effect should not run again since there is no dependency change
        expect(mockCallback).toHaveBeenCalledTimes(1)
    })
})
