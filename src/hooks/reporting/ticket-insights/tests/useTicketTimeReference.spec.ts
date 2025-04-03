import { act, renderHook } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import {
    Entity,
    getStorageKey,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import useLocalStorage from 'hooks/useLocalStorage'
import { TicketTimeReference } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('useTicketTimeReference', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)

        useLocalStorageMock.mockReturnValue([
            TicketTimeReference.TaggedAt,
            jest.fn(),
            () => void 0,
        ])
    })

    it('should return default value when the feature flag is disabled', () => {
        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))

        const [actual] = result.current
        const expected = TicketTimeReference.TaggedAt

        expect(actual).toBe(expected)
    })

    it('should return stored value when feature flag is enabled and value is valid', () => {
        useFlagMock.mockReturnValue(true)
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

    it('should return default value when feature flag is enabled but stored value is invalid', () => {
        useFlagMock.mockReturnValue(true)
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
