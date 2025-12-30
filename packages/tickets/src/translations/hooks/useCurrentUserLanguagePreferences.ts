import { useCallback, useMemo } from 'react'

import { useGetCurrentUser, UserSettingType } from '@gorgias/helpdesk-queries'
import type {
    GetCurrentUserResult,
    Language,
    UserLanguagePreferencesSetting,
    UserPreferencesSetting,
} from '@gorgias/helpdesk-types'

export type CurrentUser = GetCurrentUserResult & {
    data: GetCurrentUserResult['data'] & {
        settings: (UserPreferencesSetting | UserLanguagePreferencesSetting)[]
    }
}

export function useCurrentUserLanguagePreferences() {
    const { data: currentUser, isFetching } = useGetCurrentUser<CurrentUser>({
        query: {
            staleTime: 60000 * 5,
        },
    })

    const languagePreferences = useMemo(() => {
        const preferences = currentUser?.data?.settings?.find(
            (
                setting:
                    | UserPreferencesSetting
                    | UserLanguagePreferencesSetting,
            ) => setting.type === UserSettingType.LanguagePreferences,
        ) as UserLanguagePreferencesSetting | undefined

        return preferences?.data
    }, [currentUser])

    const languagesNotToTranslateFor = useMemo(
        () =>
            [
                languagePreferences?.primary,
                ...(languagePreferences?.proficient ?? []),
            ].filter(Boolean) as Language[],
        [languagePreferences],
    )

    const shouldShowTranslatedContent = useCallback(
        (language?: Language | null) => {
            if (!language) return false
            if (!languagePreferences?.enabled) return false
            if (!languagePreferences?.primary) return false
            if (languagesNotToTranslateFor.includes(language)) return false
            return true
        },
        [languagesNotToTranslateFor, languagePreferences],
    )

    return {
        isFetching,
        primary: languagePreferences?.primary as Language | undefined,
        proficient: languagePreferences?.proficient as Language[] | undefined,
        shouldShowTranslatedContent,
    }
}
