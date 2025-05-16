import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import ConvertStatsNavbar from 'pages/convert/common/components/ConvertStatsNavbar'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import { StatsNavLink } from 'pages/stats/common/components/StatsNav/StatsNavLink'
import { DashboardsNavbarBlock } from 'pages/stats/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'
import AutomateStatsNavbar from 'pages/stats/self-service/AutomateStatsNavbar'
import VoiceStatsNavbarItem from 'pages/stats/voice/components/VoiceStatsNavbar/VoiceStatsNavbarItem'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

import {
    BUSIEST_TIMES_OF_DAYS_NAV_LABEL,
    COMMON_NAV_LINK_PROPS,
} from './StatsNav.utils'

type FeatureFlag = boolean | undefined
type AutoQANavBarLinkProps = {
    isAvailable: boolean
}

export default function StatsNavbarView() {
    const user = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isNewSatisfactionReportEnabled: FeatureFlag =
        useFlags()[FeatureFlagKey.NewSatisfactionReport]

    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAutomate,
        [hasAutomate, isTeamLeadOrAdmin],
    )

    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}live-overview`}
                        title={'Overview'}
                    />
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}live-agents`}
                        title={'Agents'}
                    />
                    <VoiceStatsNavbarItem
                        to={`${STATS_ROUTE_PREFIX}live-voice`}
                        title="Voice"
                    />
                </div>
            </NavbarBlock>

            <DashboardsNavbarBlock navBarLinkProps={COMMON_NAV_LINK_PROPS} />

            <NavbarBlock icon="emoji_events" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                        title={'Overview'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`}
                        title={'Agents'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_BUSIEST_TIMES}`}
                        title={BUSIEST_TIMES_OF_DAYS_NAV_LABEL}
                        canduId={'statistics-link-busiest-times-of-days'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS}`}
                        title={'Channels'}
                    />
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SATISFACTION}`}
                        title={'Satisfaction'}
                    />
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_REVENUE}`}
                        title={'Revenue'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER}`}
                        title={'Help Center'}
                        canduId={'statistics-link-help-center'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT}`}
                        title={'SLAs'}
                    />
                    {!isNewSatisfactionReportEnabled && (
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />
                    )}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="lightbulb" title="Ticket Insights">
                <div className={cssNavbar.menu}>
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS}`}
                        title={'Ticket Fields'}
                    />
                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_TAGS}`}
                        title={'Tags'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_MACROS}`}
                        title={'Macros'}
                    />

                    <StatsNavLink
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.TICKET_INSIGHTS_INTENTS}`}
                        title={'Intents'}
                        canduId={'statistics-link-intents'}
                    />
                </div>
            </NavbarBlock>
            {isNewSatisfactionReportEnabled && (
                <NavbarBlock icon="star" title="Quality Management">
                    <div className={cssNavbar.menu}>
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />

                        <StatsNavLink
                            to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION}`}
                            title={'Satisfaction'}
                            isNew={true}
                        />
                    </div>
                </NavbarBlock>
            )}
            <NavbarBlock icon="bolt" title="AI Agent">
                <AutomateStatsNavbar
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </NavbarBlock>
            <NavbarBlock icon="monetization_on" title="Convert">
                <div className={cssNavbar.menu}>
                    <ConvertStatsNavbar
                        commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                    />
                </div>
            </NavbarBlock>
            <NavbarBlock title={'Voice'} icon={'phone'}>
                <ProtectedRoute
                    path={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`}
                >
                    <VoiceStatsNavbarItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_OVERVIEW}`}
                        title={'Overview'}
                    />
                </ProtectedRoute>
                <ProtectedRoute
                    path={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_AGENTS}`}
                >
                    <VoiceStatsNavbarItem
                        to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.VOICE_AGENTS}`}
                        title={'Agents'}
                    />
                </ProtectedRoute>
            </NavbarBlock>
        </>
    )
}

function AutoQANavBarLink({ isAvailable }: AutoQANavBarLinkProps) {
    if (!isAvailable) {
        return null
    }

    return (
        <StatsNavLink to={`${STATS_ROUTE_PREFIX}auto-qa`} title={'Auto QA'} />
    )
}
