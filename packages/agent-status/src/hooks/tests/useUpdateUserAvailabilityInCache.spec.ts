import { renderHook } from '@repo/testing/vitest'
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserAvailabilityDetail } from '@gorgias/helpdesk-types'

import * as utils from '../../utils'
import { useUpdateUserAvailabilityInCache } from '../useUpdateUserAvailabilityInCache'

vi.mock('../../utils', async () => {
    const actual = await vi.importActual<typeof utils>('../../utils')
    return {
        ...actual,
        updateUserAvailabilityInCache: vi.fn(),
    }
})

describe('useUpdateUserAvailabilityInCache', () => {
    beforeEach(() => {
        vi.mocked(utils.updateUserAvailabilityInCache).mockReset()
    })

    it('should forward the query client from context and the data to updateUserAvailabilityInCache', () => {
        const data: UserAvailabilityDetail = {
            user_id: 123,
            user_status: 'unavailable',
        } as UserAvailabilityDetail

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        result.current(data)

        expect(
            vi.mocked(utils.updateUserAvailabilityInCache),
        ).toHaveBeenCalledWith(expect.any(QueryClient), data)
    })

    it('should return the result of updateUserAvailabilityInCache', () => {
        const data: UserAvailabilityDetail = {
            user_id: 456,
            user_status: 'available',
        } as UserAvailabilityDetail
        const utilResult = { previousData: undefined, newData: { data } }
        vi.mocked(utils.updateUserAvailabilityInCache).mockReturnValue(
            utilResult as unknown as ReturnType<
                typeof utils.updateUserAvailabilityInCache
            >,
        )

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        expect(result.current(data)).toBe(utilResult)
    })
})
