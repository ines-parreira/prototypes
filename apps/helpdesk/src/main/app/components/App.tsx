import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

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
import AxiomMigrationHighlightTokensToggle from 'pages/common/components/AxiomMigrationHighlightTokensToggle'
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
import useAppShortcuts from '../hooks/useAppShortcuts'
import usePollingManager from '../hooks/usePollingManager'
import { useSetBanners } from '../hooks/useSetBanners'
import useSharedLogic from '../hooks/useSharedLogic'

import css from './App.less'

type Props = {
    children: ReactNode
}

export default function App({ children }: Props) {
    const {
        hasFlag: hasAxiomMigration,
        isDebugging: isAxiomDebugging,
        isEnabled: isAxiomEnabled,
        isHighlightingTokens: isAxiomHighlightingTokens,
    } = useAxiomMigration()
    const theme = useTheme()
    const history = useHistory()
    const hasGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
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
    useAppShortcuts()
    usePollingManager()
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
                axiom: hasAxiomMigration && isAxiomEnabled,
                legacy: !hasAxiomMigration || !isAxiomEnabled,
                axiomHighlightLegacyTokens:
                    hasAxiomMigration &&
                    isAxiomEnabled &&
                    isAxiomHighlightingTokens &&
                    isAxiomDebugging,
                classic: theme.resolvedName === THEME_NAME.Classic,
                globalNav: hasGlobalNav,
                uiVisionMilestone1: hasUIVisionMS1,
            })}
        >
            <UIKitRootNodeProvider>
                <SessionChangeDetection />
                <NotificationsToasts />
                <AlertNotifications />
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
                    <NotificationsOverlay />
                    {children}
                </div>
                <KeyboardHelp />
                {hasPhone && <PhoneIntegrationBar />}
                <OutOfRecoveryCodesModal />
                <AxiomMigrationHighlightTokensToggle />
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
