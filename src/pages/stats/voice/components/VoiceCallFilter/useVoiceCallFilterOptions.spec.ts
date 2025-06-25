import { act } from '@testing-library/react'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { renderHook } from 'utils/testing/renderHook'

import { VoiceCallFilterDirection } from '../../models/types'
import useVoiceCallFilterOptions from './useVoiceCallFilterOptions'

describe('useVoiceCallFilterOptions', () => {
    const onFilterSelectMock = jest.fn()

    beforeEach(() => {
        onFilterSelectMock.mockClear()
    })

    it('should initialize with default direction filter', () => {
        const { result } = renderHook(() =>
            useVoiceCallFilterOptions(onFilterSelectMock),
        )

        expect(result.current.selectedDirection).toBe(
            VoiceCallFilterDirection.All,
        )
        expect(result.current.statusFilter).toBeUndefined()
        expect(result.current.fullStatusFilter).toBeUndefined()
    })

    it.each([
        {
            direction: VoiceCallFilterDirection.Inbound,
            statusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Missed,
                VoiceCallDisplayStatus.Cancelled,
                VoiceCallDisplayStatus.Abandoned,
                VoiceCallDisplayStatus.CallbackRequested,
            ],
            fullStatusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Missed,
                VoiceCallDisplayStatus.Cancelled,
                VoiceCallDisplayStatus.Abandoned,
                VoiceCallDisplayStatus.CallbackRequested,
            ],
        },
        {
            direction: VoiceCallFilterDirection.Outbound,
            statusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Unanswered,
                VoiceCallDisplayStatus.Failed,
            ],
            fullStatusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Unanswered,
                VoiceCallDisplayStatus.Failed,
            ],
        },
    ])(
        'should update filter when direction is changed',
        ({ direction, statusFilter, fullStatusFilter }) => {
            const { result } = renderHook(() =>
                useVoiceCallFilterOptions(onFilterSelectMock),
            )

            act(() => {
                result.current.updateFilterFromDirection(direction)
            })

            expect(result.current.selectedDirection).toBe(direction)
            expect(result.current.statusFilter).toEqual(statusFilter)
            expect(result.current.fullStatusFilter).toEqual(fullStatusFilter)
            expect(onFilterSelectMock).toHaveBeenCalledWith({
                direction: direction,
                statuses: statusFilter,
            })
        },
    )

    it('should update filter when direction is changed back to all', () => {
        const { result } = renderHook(() =>
            useVoiceCallFilterOptions(onFilterSelectMock),
        )

        act(() => {
            result.current.updateFilterFromDirection(
                VoiceCallFilterDirection.Inbound,
            )
        })

        act(() => {
            result.current.updateFilterFromDirection(
                VoiceCallFilterDirection.All,
            )
        })

        expect(result.current.selectedDirection).toBe(
            VoiceCallFilterDirection.All,
        )
        expect(result.current.statusFilter).toBeUndefined()
        expect(result.current.fullStatusFilter).toBeUndefined()
        expect(onFilterSelectMock).toHaveBeenLastCalledWith({
            direction: VoiceCallFilterDirection.All,
        })
    })

    it.each([
        {
            direction: VoiceCallFilterDirection.Inbound,
            statusToToggle: VoiceCallDisplayStatus.Missed,
            expectedStatuses: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Cancelled,
                VoiceCallDisplayStatus.Abandoned,
                VoiceCallDisplayStatus.CallbackRequested,
            ],
        },
        {
            direction: VoiceCallFilterDirection.Outbound,
            statusToToggle: VoiceCallDisplayStatus.Unanswered,
            expectedStatuses: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Failed,
            ],
        },
    ])(
        'should update filter when status is changed',
        ({ direction, statusToToggle, expectedStatuses }) => {
            const { result } = renderHook(() =>
                useVoiceCallFilterOptions(onFilterSelectMock),
            )

            act(() => {
                result.current.updateFilterFromDirection(direction)
            })

            act(() => {
                result.current.toggleStatusFromFilter(statusToToggle)
            })

            expect(result.current.statusFilter).toEqual(expectedStatuses)

            act(() => {
                result.current.updateFilter()
            })

            expect(onFilterSelectMock).toHaveBeenCalledWith({
                direction: direction,
                statuses: expectedStatuses,
            })
        },
    )

    it.each([
        {
            direction: VoiceCallFilterDirection.Inbound,
            fullStatuses: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Missed,
                VoiceCallDisplayStatus.Cancelled,
                VoiceCallDisplayStatus.Abandoned,
                VoiceCallDisplayStatus.CallbackRequested,
            ],
        },
        {
            direction: VoiceCallFilterDirection.Outbound,
            fullStatuses: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Unanswered,
                VoiceCallDisplayStatus.Failed,
            ],
        },
    ])(
        'should remove and select all status filters',
        ({ direction, fullStatuses }) => {
            const { result } = renderHook(() =>
                useVoiceCallFilterOptions(onFilterSelectMock),
            )

            act(() => {
                result.current.updateFilterFromDirection(direction)
            })

            expect(result.current.statusFilter).toEqual(fullStatuses)

            act(() => {
                result.current.removeAllStatusFilter()
            })

            expect(result.current.statusFilter).toEqual([])

            act(() => {
                result.current.selectAllStatusFilter()
            })

            expect(result.current.statusFilter).toEqual(fullStatuses)
        },
    )
})
