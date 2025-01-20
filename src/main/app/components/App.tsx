import React, {ReactNode} from 'react'

import AlertBanners from 'AlertBanners'
import {AppNode} from 'appNode'

import {useShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {NotificationsToasts} from 'common/notifications'

import {useApplyTheme} from 'core/theme'
import useHasPhone from 'hooks/useHasPhone'
import {AlertNotifications} from 'notifications'
import EmailDisconnectedBanner from 'pages/common/components/EmailDisconnectedBanner'
import EmailDomainVerificationBanner from 'pages/common/components/EmailDomainVerificationBanner/EmailDomainVerificationBanner'
import EmailMigrationBanner from 'pages/common/components/EmailMigrationBanner/EmailMigrationBanner'
import KeyboardHelp from 'pages/common/components/KeyboardHelp/KeyboardHelp'
import PhoneIntegrationBar from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationBar'
import ScriptTagMigrationBanner from 'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner'
import ScriptTagMigrationModal from 'pages/common/components/ScriptTagMigrationModal/ScriptTagMigrationModal'
import SessionChangeDetection from 'pages/common/components/SessionChangeDetection'
import Spotlight from 'pages/common/components/Spotlight/Spotlight'
import OutOfRecoveryCodesModal from 'pages/settings/yourProfile/twoFactorAuthentication/OutOfRecoveryCodesModal'

import useActivityTracker from '../hooks/useActivityTracker'
import useAppShortcuts from '../hooks/useAppShortcuts'
import usePollingManager from '../hooks/usePollingManager'
import {useSetBanners} from '../hooks/useSetBanners'
import useSharedLogic from '../hooks/useSharedLogic'
import UIKitRootNodeProvider from './UIKitRootNodeProvider'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const hasGlobalNav = useShowGlobalNavFeatureFlag()
    const hasPhone = useHasPhone()

    useApplyTheme()
    useAppShortcuts()
    usePollingManager()
    useSetBanners()

    useSharedLogic()
    useActivityTracker()

    return (
        <AppNode className={hasGlobalNav ? 'globalNav' : undefined}>
            <UIKitRootNodeProvider>
                <SessionChangeDetection />
                <NotificationsToasts />
                <AlertNotifications />
                <AlertBanners />
                <EmailMigrationBanner />
                <EmailDisconnectedBanner />
                <EmailDomainVerificationBanner />
                <ScriptTagMigrationBanner />
                <ScriptTagMigrationModal />
                <Spotlight />
                {children}
                <KeyboardHelp />
                {hasPhone && <PhoneIntegrationBar />}
                <OutOfRecoveryCodesModal />
            </UIKitRootNodeProvider>
        </AppNode>
    )
}
