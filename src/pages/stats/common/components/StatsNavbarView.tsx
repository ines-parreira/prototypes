import React, { useMemo } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import ConvertStatsNavbar from 'pages/convert/common/components/ConvertStatsNavbar'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import { DashboardsNavbarBlock } from 'pages/stats/custom-reports/DashboardsNavbarBlock/DashboardsNavbarBlock'
import AutomateStatsNavbar from 'pages/stats/self-service/AutomateStatsNavbar'
import VoiceStatsNavbarItem from 'pages/stats/voice/components/VoiceStatsNavbar/VoiceStatsNavbarItem'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

type FeatureFlag = boolean | undefined
type AutoQANavBarLinkProps = {
    isAvailable: boolean
}

export const BUSIEST_TIMES_OF_DAYS_NAV_LABEL = 'Busiest times'
export const NEW_NAV_LABEL = 'NEW'

export default function StatsNavbarView() {
    const user = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isHelpCenterAnalyticsEnabled: FeatureFlag =
        useFlags()[FeatureFlagKey.HelpCenterAnalytics]
    const isNewSatisfactionReportEnabled: FeatureFlag =
        useFlags()[FeatureFlagKey.NewSatisfactionReport]
    const isAnalyticsCustomReports: FeatureFlag =
        useFlags()[FeatureFlagKey.AnalyticsCustomReports]

    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAutomate,
        [hasAutomate, isTeamLeadOrAdmin],
    )

    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}live-overview`}
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}live-agents`}
                        >
                            Agents
                        </NavbarLink>
                    </div>
                    <VoiceStatsNavbarItem
                        to={`${STATS_ROUTE_PREFIX}live-voice`}
                        title="Voice"
                        commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                    />
                </div>
            </NavbarBlock>

            {!!isAnalyticsCustomReports && (
                <DashboardsNavbarBlock
                    navBarLinkProps={COMMON_NAV_LINK_PROPS}
                />
            )}

            <NavbarBlock icon="emoji_events" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`}
                        >
                            Agents
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                        data-candu-id="statistics-link-busiest-times-of-days"
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}busiest-times-of-days`}
                        >
                            {BUSIEST_TIMES_OF_DAYS_NAV_LABEL}
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}channels`}
                        >
                            Channels
                        </NavbarLink>
                    </div>

                    {!isNewSatisfactionReportEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to={`${STATS_ROUTE_PREFIX}satisfaction`}
                            >
                                Satisfaction
                            </NavbarLink>
                        </div>
                    )}
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}revenue`}
                        >
                            Revenue
                        </NavbarLink>
                    </div>
                    {isHelpCenterAnalyticsEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                            data-candu-id="statistics-link-help-center"
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to={`${STATS_ROUTE_PREFIX}help-center`}
                            >
                                Help Center
                            </NavbarLink>
                        </div>
                    )}
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}slas`}
                        >
                            SLAs
                        </NavbarLink>
                    </div>
                    {!isNewSatisfactionReportEnabled && (
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />
                    )}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="lightbulb" title="Ticket Insights">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}ticket-fields`}
                        >
                            Ticket Fields
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}tags`}
                        >
                            Tags
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}macros`}
                        >
                            Macros
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to={`${STATS_ROUTE_PREFIX}intents`}
                            data-candu-id="statistics-link-intents"
                        >
                            Intents
                        </NavbarLink>
                    </div>
                </div>
            </NavbarBlock>
            {isNewSatisfactionReportEnabled && (
                <NavbarBlock icon="star" title="Quality Management">
                    <div className={cssNavbar.menu}>
                        <AutoQANavBarLink
                            isAvailable={isAutoQANavLinkAvailable}
                        />
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested,
                            )}
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to={`${STATS_ROUTE_PREFIX}quality-management-satisfaction`}
                            >
                                Satisfaction
                                <Badge
                                    type={'blue'}
                                    className={cssNavbar.badge}
                                >
                                    {NEW_NAV_LABEL}
                                </Badge>
                            </NavbarLink>
                        </div>
                    </div>
                </NavbarBlock>
            )}
            <NavbarBlock icon="bolt" title="Automate">
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
                <VoiceStatsNavbarItem
                    to={`${STATS_ROUTE_PREFIX}voice-overview`}
                    title={'Overview'}
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
                <VoiceStatsNavbarItem
                    to={`${STATS_ROUTE_PREFIX}voice-agents`}
                    title={'Agents'}
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </NavbarBlock>
        </>
    )
}

function AutoQANavBarLink({ isAvailable }: AutoQANavBarLinkProps) {
    if (!isAvailable) {
        return null
    }

    return (
        <div
            className={classNames(
                cssNavbar['link-wrapper'],
                cssNavbar.isNested,
            )}
        >
            <NavbarLink
                {...COMMON_NAV_LINK_PROPS}
                to={`${STATS_ROUTE_PREFIX}auto-qa`}
            >
                Auto QA
            </NavbarLink>
        </div>
    )
}
