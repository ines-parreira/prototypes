import { useMemo } from 'react'

import { LoadingSpinner } from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { UserLanguagePreferencesSetting } from '@gorgias/helpdesk-types'
import { UserSettingType } from '@gorgias/helpdesk-types'

import { UserRole } from 'config/types/user'

import { YourProfileView } from './components/YourProfileView'
import type { ApplicationUserPreferencesSettings, CurrentUser } from './types'

function YourProfileContainer() {
    const { data: currentUser } = useGetCurrentUser<CurrentUser>()

    const settingsPreferences = useMemo(() => {
        if (!currentUser || !currentUser.data?.settings) return

        return currentUser.data.settings.find(
            (setting) => setting.type === UserSettingType.Preferences,
        ) as ApplicationUserPreferencesSettings
    }, [currentUser])

    const languagePreferences = useMemo(() => {
        if (!currentUser || !currentUser.data?.settings) return

        return currentUser.data.settings.find(
            (setting) => setting.type === UserSettingType.LanguagePreferences,
        ) as UserLanguagePreferencesSetting
    }, [currentUser])

    const isGorgiasAgent = useMemo(
        () => currentUser?.data?.role?.name === UserRole.GorgiasAgent,
        [currentUser],
    )

    const currentUserProfileInfo = useMemo(
        () => ({
            id: currentUser?.data?.id,
            name: currentUser?.data?.name,
            email: currentUser?.data?.email,
            bio: currentUser?.data?.bio,
            timezone: currentUser?.data?.timezone,
            language: currentUser?.data?.language,
            settings: currentUser?.data?.settings,
            meta: currentUser?.data?.meta,
        }),
        [currentUser],
    )

    if (!currentUser?.data) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}
            >
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <YourProfileView
            currentUser={currentUserProfileInfo}
            settingsPreferences={settingsPreferences}
            languagePreferences={languagePreferences}
            isGorgiasAgent={isGorgiasAgent}
        />
    )
}

export default YourProfileContainer
