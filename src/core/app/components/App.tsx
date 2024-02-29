import React, {ReactNode} from 'react'

import {AppNode} from 'appNode'
import {AlertNotifications, BannerNotifications} from 'notifications'
import EmailMigrationBanner from 'pages/common/components/EmailMigrationBanner/EmailMigrationBanner'
import EmailDisconnectedBanner from 'pages/common/components/EmailDisconnectedBanner'
import KeyboardHelp from 'pages/common/components/KeyboardHelp/KeyboardHelp'
import LogoutDetection from 'pages/common/components/LogoutDetection'
import PhoneIntegrationBar from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationBar'
import ScriptTagMigrationBanner from 'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner'
import ScriptTagMigrationModal from 'pages/common/components/ScriptTagMigrationModal/ScriptTagMigrationModal'
import Spotlight from 'pages/common/components/Spotlight/Spotlight'
import {useTheme} from 'theme'

import EmailDomainVerificationBanner from 'pages/common/components/EmailDomainVerificationBanner'

import useActivityTracker from '../hooks/useActivityTracker'
import useAppShortcuts from '../hooks/useAppShortcuts'
import usePollingManager from '../hooks/usePollingManager'
import useSharedLogic from '../hooks/useSharedLogic'
import useHasPhone from '../hooks/useHasPhone'
import useStatusPageManager from '../hooks/useStatusPageManager'
import useUsageBanner from '../hooks/useUsageBanner'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const theme = useTheme()
    const hasPhone = useHasPhone()

    useAppShortcuts()
    usePollingManager()
    useStatusPageManager()
    useUsageBanner()

    useSharedLogic()
    useActivityTracker()

    return (
        <AppNode className={theme}>
            <LogoutDetection />
            <BannerNotifications />
            <EmailMigrationBanner />
            <EmailDisconnectedBanner />
            <EmailDomainVerificationBanner />
            <ScriptTagMigrationBanner />
            <ScriptTagMigrationModal />
            <Spotlight />
            {children}
            <KeyboardHelp />
            <AlertNotifications />
            {hasPhone && <PhoneIntegrationBar />}
        </AppNode>
    )
}
