import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DomainEvent } from '@gorgias/events'

import { renderHook } from '../../tests/render.utils'
import { useUpdateUserAvailabilityInCache } from '../useUpdateUserAvailabilityInCache'
import { useUserAvailabilityRealtimeHandler } from '../useUserAvailabilityRealtimeHandler'

vi.mock('../useUpdateUserAvailabilityInCache', () => ({
    useUpdateUserAvailabilityInCache: vi.fn(),
}))

const mockUseUpdateUserAvailabilityInCache =
    useUpdateUserAvailabilityInCache as ReturnType<typeof vi.fn>

describe('useUserAvailabilityRealtimeHandler', () => {
    const mockUpdateUserAvailabilityInCache = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseUpdateUserAvailabilityInCache.mockReturnValue(
            mockUpdateUserAvailabilityInCache,
        )
    })

    const createDomainEvent = (
        dataschema: string,
        data: Record<string, unknown>,
    ) => ({
        specversion: '1.0',
        type: 'test.event',
        source: 'test-source',
        subject: 'test-subject',
        id: 'test-id',
        time: new Date().toISOString(),
        datacontenttype: 'application/json',
        dataschema,
        data,
    })

    it('should handle user-availability.created event', () => {
        const { result } = renderHook(() =>
            useUserAvailabilityRealtimeHandler(),
        )

        const event = createDomainEvent(
            '//helpdesk/user-availability.created/1.0.1',
            {
                user_id: 123,
                user_status: 'available',
                custom_user_availability_status_id: null,
            },
        )

        result.current(event as unknown as DomainEvent)

        expect(mockUpdateUserAvailabilityInCache).toHaveBeenCalledWith({
            user_id: 123,
            user_status: 'available',
            custom_user_availability_status_id: null,
        })
    })

    it('should handle user-availability.updated event', () => {
        const { result } = renderHook(() =>
            useUserAvailabilityRealtimeHandler(),
        )

        const event = createDomainEvent(
            '//helpdesk/user-availability.updated/1.0.1',
            {
                user_id: 456,
                user_status: 'unavailable',
                custom_user_availability_status_id: 'custom-123',
            },
        )

        result.current(event as unknown as DomainEvent)

        expect(mockUpdateUserAvailabilityInCache).toHaveBeenCalledWith({
            user_id: 456,
            user_status: 'unavailable',
            custom_user_availability_status_id: 'custom-123',
        })
    })

    it('should not call updateUserAvailabilityInCache for unknown event types', () => {
        const { result } = renderHook(() =>
            useUserAvailabilityRealtimeHandler(),
        )

        const event = createDomainEvent('//helpdesk/some-other-event/1.0.0', {
            user_id: 123,
            user_status: 'available',
        })

        result.current(event as unknown as DomainEvent)

        expect(mockUpdateUserAvailabilityInCache).not.toHaveBeenCalled()
    })
})
