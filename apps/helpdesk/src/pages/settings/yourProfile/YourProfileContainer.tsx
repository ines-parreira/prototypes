import { useMemo } from 'react'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import { UserSettingType } from '@gorgias/helpdesk-types'

import { DEFAULT_PREFERENCES } from 'config'
import { UserRole } from 'config/types/user'

import { YourProfileView } from './components/YourProfileView'
import { ApplicationUserPreferencesSettings, CurrentUser } from './types'

function YourProfileContainer() {
    const { data: currentUser } = useGetCurrentUser<CurrentUser>()

    const preferences = useMemo(() => {
        if (!currentUser || !currentUser.data?.settings) {
            return DEFAULT_PREFERENCES as Partial<
                ApplicationUserPreferencesSettings['data']
            >
        }

        const settingsPreferences = currentUser.data.settings.find(
            (setting) => setting.type === UserSettingType.Preferences,
        ) as ApplicationUserPreferencesSettings

        return {
            ...DEFAULT_PREFERENCES,
            ...(settingsPreferences?.data || {}),
        } as Partial<ApplicationUserPreferencesSettings['data']>
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
        return <div>Loading...</div>
    }

    return (
        <YourProfileView
            currentUser={currentUserProfileInfo}
            preferences={preferences}
            isGorgiasAgent={isGorgiasAgent}
        />
    )
}

export default YourProfileContainer
