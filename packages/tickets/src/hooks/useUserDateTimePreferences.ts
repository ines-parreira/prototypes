import { DateFormatType, TimeFormatType } from '@repo/utils'

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

export function useUserDateTimePreferences() {
    const { data: currentUser } = useGetCurrentUser<CurrentUser>()

    const preferencesData = (
        currentUser?.data?.settings?.find(
            (s) => s.type === UserSettingType.Preferences,
        ) as UserPreferencesSetting | undefined
    )?.data as
        | { date_format?: DateFormatType; time_format?: TimeFormatType }
        | undefined

    return {
        dateFormat: preferencesData?.date_format ?? DateFormatType.en_US,
        timeFormat: preferencesData?.time_format ?? TimeFormatType.AmPm,
    }
}
