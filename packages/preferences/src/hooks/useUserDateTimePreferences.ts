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

export type UserDateTimePreferences = {
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    timezone?: string
}

export type QueryOptions = {
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
}

export function useUserDateTimePreferences({
    staleTime = DurationInMs.OneDay,
    cacheTime = DurationInMs.OneDay,
    enabled = true,
}: QueryOptions = {}): UserDateTimePreferences {
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
            timezone: currentUser?.data?.timezone,
        }
    }, [currentUser])

    return preferences
}
