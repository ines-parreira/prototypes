import React, {ReactNode} from 'react'

import {AppNode} from 'appNode'
import {AlertNotifications, BannerNotifications} from 'notifications'
import EmailMigrationBanner from 'pages/common/components/EmailMigrationBanner/EmailMigrationBanner'
import KeyboardHelp from 'pages/common/components/KeyboardHelp/KeyboardHelp'
import ScriptTagMigrationBanner from 'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner'
import {useTheme} from 'theme'

import useAppShortcuts from '../hooks/useAppShortcuts'
import useStatusPageManager from '../hooks/useStatusPageManager'
import useUsageBanner from '../hooks/useUsageBanner'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const theme = useTheme()

    useAppShortcuts()
    useStatusPageManager()
    useUsageBanner()

    return (
        <AppNode className={theme}>
            <BannerNotifications />
            <EmailMigrationBanner />
            <ScriptTagMigrationBanner />
            {children}
            <KeyboardHelp />
            <AlertNotifications />
        </AppNode>
    )
}
