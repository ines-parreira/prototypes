import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import ConvertStatsNavbar from 'pages/convert/common/components/ConvertStatsNavbar'
import AutomateStatsNavbar from 'pages/stats/self-service/AutomateStatsNavbar'
import VoiceStatsNavbarItem from 'pages/stats/voice/components/VoiceStatsNavbar/VoiceStatsNavbarItem'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

export const BUSIEST_TIMES_OF_DAYS_NAV_LABEL = 'Busiest times'
export const NEW_NAV_LABEL = 'NEW'

export default function StatsNavbarView() {
    const user = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isHelpCenterAnalyticsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.HelpCenterAnalytics]
    const isAutoQAEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsAutoQA]
    const isNewTagsReportEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.NewTagsReport]

    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/live-overview"
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/live-agents"
                        >
                            Agents
                        </NavbarLink>
                    </div>
                    <VoiceStatsNavbarItem
                        to="/app/stats/live-voice"
                        title="Voice"
                        commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                    />
                </div>
            </NavbarBlock>
            <NavbarBlock icon="emoji_events" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/support-performance-overview"
                        >
                            Overview
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/support-performance-agents"
                        >
                            Agents
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        data-candu-id="statistics-link-busiest-times-of-days"
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/busiest-times-of-days"
                        >
                            {BUSIEST_TIMES_OF_DAYS_NAV_LABEL}
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/channels"
                        >
                            Channels
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/satisfaction"
                        >
                            Satisfaction
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/revenue"
                        >
                            Revenue
                        </NavbarLink>
                    </div>
                    {isHelpCenterAnalyticsEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                            data-candu-id="statistics-link-help-center"
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to="/app/stats/help-center"
                            >
                                Help Center
                            </NavbarLink>
                        </div>
                    )}
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/slas"
                        >
                            SLAs
                        </NavbarLink>
                    </div>
                    {!!isAutoQAEnabled && isTeamLeadOrAdmin && hasAutomate && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                        >
                            <NavbarLink
                                {...COMMON_NAV_LINK_PROPS}
                                to="/app/stats/auto-qa"
                            >
                                Auto QA{' '}
                                <Badge
                                    type={ColorType.Blue}
                                    className={cssNavbar.badge}
                                >
                                    {NEW_NAV_LABEL}
                                </Badge>
                            </NavbarLink>
                        </div>
                    )}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="lightbulb" title="Ticket Insights">
                <div className={cssNavbar.menu}>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/ticket-fields"
                        >
                            Ticket Fields
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/tags"
                        >
                            Tags{' '}
                            {isNewTagsReportEnabled && (
                                <Badge
                                    type={ColorType.Blue}
                                    className={cssNavbar.badge}
                                >
                                    {NEW_NAV_LABEL}
                                </Badge>
                            )}
                        </NavbarLink>
                    </div>

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/macros"
                        >
                            Macros
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/intents"
                            data-candu-id="statistics-link-intents"
                        >
                            Intents
                        </NavbarLink>
                    </div>
                </div>
            </NavbarBlock>
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
                    to={'/app/stats/voice-overview'}
                    title={'Overview'}
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
                <VoiceStatsNavbarItem
                    to={'/app/stats/voice-agents'}
                    title={'Agents'}
                    commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                />
            </NavbarBlock>
        </>
    )
}
