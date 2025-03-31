import { renderHook } from '@testing-library/react-hooks'

import { useFlag } from 'core/flags'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import useLocalStorage from 'hooks/useLocalStorage'
import { TicketTimeReference } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

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
        const expected = TicketTimeReference.TaggedAt

        expect(actual).toBe(expected)
    })

    it('should use correct storage key based on entity', () => {
        renderHook(() => useTicketTimeReference(Entity.TicketField))

        expect(useLocalStorageMock).toHaveBeenCalledWith(
            'TicketField:time-reference',
            TicketTimeReference.TaggedAt,
        )
    })

    it('should return setter function', () => {
        const mockSetter = jest.fn()
        useLocalStorageMock.mockReturnValue([
            TicketTimeReference.TaggedAt,
            mockSetter,
            () => void 0,
        ])

        const { result } = renderHook(() => useTicketTimeReference(Entity.Tag))
        const [, setter] = result.current

        expect(setter).toBe(mockSetter)
    })
})
