import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    Entity,
    getStorageKey,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('useTicketTimeReference', () => {
    beforeEach(() => {
        useLocalStorageMock.mockReturnValue([
            TicketTimeReference.CreatedAt,
            jest.fn(),
            () => void 0,
        ])
    })

    it('should return stored value when value is valid', () => {
        useLocalStorageMock.mockReturnValue([
            TicketTimeReference.CreatedAt,
            jest.fn(),
            () => void 0,
        ])

        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))

        const [actual] = result.current
        const expected = TicketTimeReference.CreatedAt

        expect(actual).toBe(expected)
    })

    it('should return default value when stored value is invalid', () => {
        useLocalStorageMock.mockReturnValue([
            'invalid-value',
            jest.fn(),
            () => void 0,
        ])

        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))

        const [actual] = result.current
        const expected = TicketTimeReference.CreatedAt

        expect(actual).toBe(expected)
    })

    it('should use correct storage key based on entity', () => {
        renderHook(() => useTicketTimeReference(Entity.TicketField))

        expect(useLocalStorageMock).toHaveBeenCalledWith(
            getStorageKey(Entity.TicketField),
            TicketTimeReference.CreatedAt,
        )
    })

    it('should return setter function', () => {
        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))
        const [, setter] = result.current

        expect(typeof setter).toBe('function')
    })

    it('should log event when time reference changes', () => {
        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))
        const [, setter] = result.current

        act(() => {
            setter(TicketTimeReference.CreatedAt)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatTimeframePreferenceSelection,
            {
                value: TicketTimeReference.CreatedAt,
                report: Entity.Tag,
            },
        )
    })
})
