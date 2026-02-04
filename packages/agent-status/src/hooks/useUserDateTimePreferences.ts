import { useMemo } from 'react'

import { DateFormatType, DurationInMs, TimeFormatType } from '@repo/utils'

import type {
    GetCurrentUserResult,
    UserPreferencesSetting,
} from '@gorgias/helpdesk-queries'
import { useGetCurrentUser, UserSettingType } from '@gorgias/helpdesk-queries'

type CurrentUser = GetCurrentUserResult & {
    data: GetCurrentUserResult['data'] & {
        settings: UserPreferencesSetting[]
    }
}

type DatePreferences = {
    date_format?: DateFormatType
    time_format?: TimeFormatType
}

type UserDateTimePreferences = {
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
}

type QueryOptions = {
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
}

/**
 * Hook to get the current user's date and time format preferences
 *
 * @returns Object containing user's date and time format preferences
 * - dateFormat: DateFormatType.en_US (MM/DD) or DateFormatType.en_GB (DD/MM)
 * - timeFormat: TimeFormatType.AmPm (12-hour) or TimeFormatType.TwentyFourHour (24-hour)
 *
 * @example
 * const { dateFormat, timeFormat } = useUserDateTimePreferences()
 * // dateFormat: DateFormatType.en_US
 * // timeFormat: TimeFormatType.AmPm
 */
export function useUserDateTimePreferences({
    staleTime = DurationInMs.OneDay,
    cacheTime = DurationInMs.OneDay,
    enabled = true,
}: QueryOptions): UserDateTimePreferences {
    const { data: currentUser } = useGetCurrentUser<CurrentUser>({
        query: {
            staleTime,
            cacheTime,
            enabled,
        },
    })

    const preferences = useMemo<UserDateTimePreferences>(() => {
        const preferences = currentUser?.data?.settings?.find(
            (s) => s.type === UserSettingType.Preferences,
        )

        const prefData = preferences?.data as DatePreferences | undefined

        const { date_format, time_format } = prefData ?? {}

        return {
            dateFormat: date_format ?? DateFormatType.en_US,
            timeFormat: time_format ?? TimeFormatType.AmPm,
        }
    }, [currentUser])

    return preferences
}
