import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { useFilterOperations } from '../useFilterOperations'

describe('useFilterOperations', () => {
    let setAssignedChannelIds: jest.Mock

    beforeEach(() => {
        setAssignedChannelIds = jest.fn()
    })

    it('should update selected integrations', () => {
        const { result } = renderHook(() =>
            useFilterOperations(setAssignedChannelIds),
        )
        const selectedIds = [1, 2, 3]

        act(() => {
            result.current.updateSelectedIntegrations(selectedIds)
        })

        expect(result.current.selectedFilterItems).toEqual(selectedIds)
    })

    it('should handle filter close by updating assigned channel ids and clearing selection', () => {
        const { result } = renderHook(() =>
            useFilterOperations(setAssignedChannelIds),
        )
        const selectedIds = [1, 2, 3]

        act(() => {
            result.current.updateSelectedIntegrations(selectedIds)
        })

        act(() => {
            result.current.handleFilterClose()
        })

        expect(setAssignedChannelIds).toHaveBeenCalled()
        expect(result.current.selectedFilterItems).toEqual([])
    })
})
