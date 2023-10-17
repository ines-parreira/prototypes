import React, {ReactNode} from 'react'

import {AppNode} from 'appNode'
import {AlertNotifications, BannerNotifications} from 'notifications'
import EmailMigrationBanner from 'pages/common/components/EmailMigrationBanner/EmailMigrationBanner'
import ScriptTagMigrationBanner from 'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner'
import {useTheme} from 'theme'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const theme = useTheme()

    return (
        <AppNode className={theme}>
            <BannerNotifications />
            <EmailMigrationBanner />
            <ScriptTagMigrationBanner />
            {children}
            <AlertNotifications />
        </AppNode>
    )
}
