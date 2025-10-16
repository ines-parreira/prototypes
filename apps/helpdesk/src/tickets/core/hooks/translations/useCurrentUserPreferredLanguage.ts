import { useCallback, useMemo } from 'react'

import { useGetCurrentUser, UserSettingType } from '@gorgias/helpdesk-queries'
import {
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

export function useCurrentUserPreferredLanguage() {
    const { data: currentUser } = useGetCurrentUser<CurrentUser>({
        query: {
            staleTime: 60000 * 5,
        },
    })

    const languagePreferences = useMemo(() => {
        const preferences = currentUser?.data?.settings?.find(
            (setting) => setting.type === UserSettingType.LanguagePreferences,
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
        (language?: Language | null) =>
            !language
                ? false
                : !languagePreferences?.primary
                  ? false
                  : !languagesNotToTranslateFor.includes(language),
        [languagesNotToTranslateFor, languagePreferences],
    )

    return {
        primary: languagePreferences?.primary as Language | undefined,
        proficient: languagePreferences?.proficient as Language[] | undefined,
        shouldShowTranslatedContent,
    }
}
