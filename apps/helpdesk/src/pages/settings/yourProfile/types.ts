import type { GetCurrentUserResult } from '@gorgias/helpdesk-queries'
import type {
    UserPreferencesSetting,
    UserSetting,
} from '@gorgias/helpdesk-types'

import type { DateFormatType, TimeFormatType } from 'constants/datetime'

export type ApplicationUserPreferencesSettings = UserPreferencesSetting & {
    data: UserPreferencesSetting['data'] & {
        time_format?: TimeFormatType
        date_format?: DateFormatType
        forward_when_offline?: boolean
        show_macros_suggestions?: boolean
        available?: boolean
    }
}

// Temp composed to while the sdk useGetCurrentUser doesn't return the correct type
export type CurrentUser = GetCurrentUserResult & {
    data: GetCurrentUserResult['data'] & {
        settings: (
            | Exclude<UserSetting, UserPreferencesSetting>
            | ApplicationUserPreferencesSettings
        )[]
    }
}
