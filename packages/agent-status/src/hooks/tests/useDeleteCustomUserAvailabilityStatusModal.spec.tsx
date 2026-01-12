import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { AgentStatusWithSystem } from '../../types'
import { useDeleteCustomUserAvailabilityStatusModal } from '../useDeleteCustomUserAvailabilityStatusModal'

describe('useDeleteCustomUserAvailabilityStatusModal', () => {
    describe('initial state', () => {
        it('should initialize with modal closed', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            expect(result.current.deleteModalState).toEqual({
                isOpen: false,
                statusId: null,
                statusName: null,
            })
        })
    })

    describe('openStatusDeleteModal', () => {
        it('should open modal and set status details', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            const mockStatus: AgentStatusWithSystem = {
                id: 'status-123',
                name: 'Lunch Break',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            act(() => {
                result.current.openStatusDeleteModal(mockStatus)
            })

            expect(result.current.deleteModalState).toEqual({
                isOpen: true,
                statusId: 'status-123',
                statusName: 'Lunch Break',
            })
        })

        it('should handle system statuses', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            const systemStatus: AgentStatusWithSystem = {
                id: 'system-status',
                name: 'Unavailable',
                duration_unit: 'minutes',
                duration_value: 0,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: true,
            }

            act(() => {
                result.current.openStatusDeleteModal(systemStatus)
            })

            expect(result.current.deleteModalState).toEqual({
                isOpen: true,
                statusId: 'system-status',
                statusName: 'Unavailable',
            })
        })

        it('should update state when called multiple times', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            const firstStatus: AgentStatusWithSystem = {
                id: 'status-1',
                name: 'Coffee Break',
                duration_unit: 'minutes',
                duration_value: 15,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const secondStatus: AgentStatusWithSystem = {
                id: 'status-2',
                name: 'Meeting',
                duration_unit: 'hours',
                duration_value: 1,
                created_datetime: '2024-01-02T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
                is_system: false,
            }

            act(() => {
                result.current.openStatusDeleteModal(firstStatus)
            })

            expect(result.current.deleteModalState.statusName).toBe(
                'Coffee Break',
            )

            act(() => {
                result.current.openStatusDeleteModal(secondStatus)
            })

            expect(result.current.deleteModalState).toEqual({
                isOpen: true,
                statusId: 'status-2',
                statusName: 'Meeting',
            })
        })
    })

    describe('closeStatusDeleteModal', () => {
        it('should close modal and reset status details', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            const mockStatus: AgentStatusWithSystem = {
                id: 'status-123',
                name: 'Lunch Break',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            act(() => {
                result.current.openStatusDeleteModal(mockStatus)
            })

            expect(result.current.deleteModalState.isOpen).toBe(true)

            act(() => {
                result.current.closeStatusDeleteModal()
            })

            expect(result.current.deleteModalState).toEqual({
                isOpen: false,
                statusId: null,
                statusName: null,
            })
        })

        it('should work when modal is already closed', () => {
            const { result } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            expect(result.current.deleteModalState.isOpen).toBe(false)

            act(() => {
                result.current.closeStatusDeleteModal()
            })

            expect(result.current.deleteModalState).toEqual({
                isOpen: false,
                statusId: null,
                statusName: null,
            })
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references', () => {
            const { result, rerender } = renderHook(() =>
                useDeleteCustomUserAvailabilityStatusModal(),
            )

            const firstOpenCallback = result.current.openStatusDeleteModal
            const firstCloseCallback = result.current.closeStatusDeleteModal

            rerender()

            expect(result.current.openStatusDeleteModal).toBe(firstOpenCallback)
            expect(result.current.closeStatusDeleteModal).toBe(
                firstCloseCallback,
            )
        })
    })
})
