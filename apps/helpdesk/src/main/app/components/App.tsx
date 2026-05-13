import { useEffect } from 'react'
import type { ReactNode } from 'react'

import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'

import { Toaster } from '@gorgias/axiom'

import '@repo/routing/urlTracking'

import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'
import { useHistory } from 'react-router-dom'

import AlertBanners from 'AlertBanners'
import { AppNode } from 'appNode'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import {
    NotificationsOverlay,
    NotificationsToasts,
    useDesktopNotifications,
} from 'common/notifications'
import { THEME_NAME, useApplyTheme, useTheme } from 'core/theme'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import useHasPhone from 'hooks/useHasPhone'
import UIKitRootNodeProvider from 'main/app/components/UIKitRootNodeProvider'
import { isAiAgentOnboarding } from 'main/app/utils/isAiAgentOnboarding'
import { AlertNotifications } from 'notifications'
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
import { useAutomateRedirects } from 'settings/automate'
import { useRedirectDeprecatedTicketRoutes } from 'tickets/core/hooks'

import ImpersonationBanner from '../../../AlertBanners/components/ImpersonationBanner'
import useActivityTracker from '../hooks/useActivityTracker'
import useApplyWayfindingMs1 from '../hooks/useApplyWayfindingMs1'
import useAppShortcuts from '../hooks/useAppShortcuts'
import useInitialViewCountsFetch from '../hooks/useInitialViewCountsFetch'
import usePollingManager from '../hooks/usePollingManager'
import { useSetBanners } from '../hooks/useSetBanners'
import useSharedLogic from '../hooks/useSharedLogic'
import useViewCountScheduler from '../hooks/useViewCountScheduler'
import useViewCountSchedulerV3 from '../hooks/useViewCountSchedulerV3'

import css from './App.less'

type Props = {
    children: ReactNode
}

export default function App({ children }: Props) {
    const { isEnabled: isAxiomEnabled } = useAxiomMigration()
    const theme = useTheme()
    const history = useHistory()
    const hasGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const hasPhone = useHasPhone()
    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            scriptTagMigrationBanner: false,
            emailDomainVerificationBanner: false,
            emailDisconnectedBanner: false,
            emailMigrationBanner: false,
        },
    )
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

    useApplyTheme()
    useApplyWayfindingMs1()
    useAppShortcuts()
    useInitialViewCountsFetch()
    usePollingManager()
    useViewCountScheduler()
    useViewCountSchedulerV3()
    useSetBanners()
    useDesktopNotifications()

    useSharedLogic()
    useActivityTracker()

    useAutomateRedirects()
    useRedirectDeprecatedTicketRoutes()

    useEffect(() => {
        const ids = ['gorgias-chat-container', 'gaia-embed-btn']

        const tryApply = () => {
            ids.forEach((id) => {
                document
                    .getElementById(id)
                    ?.setAttribute('data-react-aria-top-layer', 'true')
            })
        }

        tryApply()

        const observer = new MutationObserver(tryApply)
        observer.observe(document.body, { childList: true, subtree: false })
        return () => observer.disconnect()
    }, [])

    const isOnboarding = isAiAgentOnboarding(history.location.pathname)

    return (
        <AppNode
            className={cn({
                axiom: isAxiomEnabled,
                legacy: !isAxiomEnabled,
                classic: theme.resolvedName === THEME_NAME.Classic,
                globalNav: hasGlobalNav,
                uiVisionMilestone1: hasUIVisionMS1,
            })}
        >
            <UIKitRootNodeProvider>
                <SessionChangeDetection />
                <NotificationsToasts />
                <AlertNotifications />
                <Toaster />
                {!isOnboarding && (
                    <>
                        <AlertBanners />
                        <ImpersonationBanner />
                        {!bannerList?.scriptTagMigrationBanner && (
                            <ScriptTagMigrationBanner />
                        )}
                        {!bannerList?.emailDomainVerificationBanner && (
                            <EmailDomainVerificationBanner />
                        )}
                        {!bannerList?.emailDisconnectedBanner && (
                            <EmailDisconnectedBanner />
                        )}
                        {!bannerList?.emailMigrationBanner && (
                            <EmailMigrationBanner />
                        )}
                    </>
                )}
                <ScriptTagMigrationModal />
                <Spotlight />
                <div className={css.content}>
                    {!hasWayfindingMS1Flag && <NotificationsOverlay />}
                    {children}
                </div>
                <KeyboardHelp />
                {hasPhone && <PhoneIntegrationBar />}
                <OutOfRecoveryCodesModal />
            </UIKitRootNodeProvider>
            <div
                id="notifications-root"
                data-react-aria-top-layer="true"
                style={{
                    position: 'fixed',
                    zIndex: 10000,
                    pointerEvents: 'none',
                }}
            />
        </AppNode>
    )
}
