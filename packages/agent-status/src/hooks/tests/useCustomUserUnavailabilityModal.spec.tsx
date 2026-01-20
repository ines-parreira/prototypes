import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { AgentStatusWithSystem } from '../../types'
import { useCustomUserUnavailabilityModal } from '../useCustomUserUnavailabilityModal'

const mockStatus: AgentStatusWithSystem = {
    id: '123',
    name: 'Lunch Break',
    description: 'Taking lunch',
    duration_unit: 'minutes',
    duration_value: 30,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    is_system: false,
}

describe('useCustomUserUnavailabilityModal', () => {
    describe('Initial state', () => {
        it('should start with modal closed, not in delete mode, and no status', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            expect(result.current.state).toEqual({
                isOpen: false,
                isDelete: false,
                status: undefined,
            })
        })
    })

    describe('openCreate', () => {
        it('should open modal without status and not in delete mode', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            act(() => {
                result.current.openCreate()
            })

            expect(result.current.state).toEqual({
                isOpen: true,
                isDelete: false,
                status: undefined,
            })
        })
    })

    describe('openEdit', () => {
        it('should open modal with provided status and not in delete mode', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            act(() => {
                result.current.openEdit(mockStatus)
            })

            expect(result.current.state).toEqual({
                isOpen: true,
                isDelete: false,
                status: mockStatus,
            })
        })
    })

    describe('openDelete', () => {
        it('should open modal with provided status in delete mode', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            act(() => {
                result.current.openDelete(mockStatus)
            })

            expect(result.current.state).toEqual({
                isOpen: true,
                isDelete: true,
                status: mockStatus,
            })
        })
    })

    describe('close', () => {
        it('should close modal and clear status and delete mode', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            act(() => {
                result.current.openEdit(mockStatus)
            })

            act(() => {
                result.current.close()
            })

            expect(result.current.state).toEqual({
                isOpen: false,
                isDelete: false,
                status: undefined,
            })
        })

        it('should close modal from delete mode and clear state', () => {
            const { result } = renderHook(() =>
                useCustomUserUnavailabilityModal(),
            )

            act(() => {
                result.current.openDelete(mockStatus)
            })

            act(() => {
                result.current.close()
            })

            expect(result.current.state).toEqual({
                isOpen: false,
                isDelete: false,
                status: undefined,
            })
        })
    })
})
