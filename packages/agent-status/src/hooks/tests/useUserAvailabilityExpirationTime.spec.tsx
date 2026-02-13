import * as userHooks from '@repo/user'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import * as utils from '../../utils/formatExpirationTime'
import { useUserAvailabilityExpirationTime } from '../useUserAvailabilityExpirationTime'

vi.mock('@repo/user', async () => {
    const actual = await vi.importActual<typeof userHooks>('@repo/user')
    return {
        ...actual,
        useUserDateTimePreferences: vi.fn(),
    }
})

vi.mock('../../utils/formatExpirationTime', async () => {
    const actual = await vi.importActual<typeof utils>(
        '../../utils/formatExpirationTime',
    )
    return {
        ...actual,
        formatExpirationTime: vi.fn(),
    }
})

describe('useUserAvailabilityExpirationTime', () => {
    beforeEach(() => {
        vi.mocked(userHooks.useUserDateTimePreferences).mockReturnValue({
            dateFormat: DateFormatType.en_US,
            timeFormat: TimeFormatType.AmPm,
            timezone: 'America/New_York',
        })

        vi.mocked(utils.formatExpirationTime).mockReturnValue('mocked time')
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('returns undefined when expiresAt is undefined', () => {
        const { result } = renderHook(() =>
            useUserAvailabilityExpirationTime(undefined),
        )

        expect(result.current).toBeUndefined()
        expect(utils.formatExpirationTime).not.toHaveBeenCalled()
    })

    it('calls formatExpirationTime with user preferences and returns result', () => {
        vi.mocked(utils.formatExpirationTime).mockReturnValue('2:30pm')

        const expiresAt = '2026-01-30T14:30:00Z'
        const { result } = renderHook(() =>
            useUserAvailabilityExpirationTime(expiresAt),
        )

        expect(utils.formatExpirationTime).toHaveBeenCalledWith(
            expiresAt,
            DateFormatType.en_US,
            TimeFormatType.AmPm,
            'America/New_York',
        )
        expect(result.current).toBe('2:30pm')
    })
})
