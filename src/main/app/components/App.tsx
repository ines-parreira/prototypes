import React, {ReactNode} from 'react'

import AlertBanners from 'AlertBanners'
import {AppNode} from 'appNode'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {NotificationsOverlay, NotificationsToasts} from 'common/notifications'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
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
import css from './App.less'
import UIKitRootNodeProvider from './UIKitRootNodeProvider'

type Props = {
    children: ReactNode
}

export default function App({children}: Props) {
    const hasGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasPhone = useHasPhone()
    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            scriptTagMigrationBanner: false,
        }
    )

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
                {!bannerList?.scriptTagMigrationBanner && (
                    <ScriptTagMigrationBanner />
                )}
                <ScriptTagMigrationModal />
                <Spotlight />
                <div className={css.content}>
                    <NotificationsOverlay />
                    {children}
                </div>
                <KeyboardHelp />
                {hasPhone && <PhoneIntegrationBar />}
                <OutOfRecoveryCodesModal />
            </UIKitRootNodeProvider>
        </AppNode>
    )
}
