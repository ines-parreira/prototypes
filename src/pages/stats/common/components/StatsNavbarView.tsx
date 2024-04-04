import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'
import ConvertStatsNavbar from 'pages/convert/common/components/ConvertStatsNavbar'
import VoiceStatsNavbarItem from 'pages/stats/voice/components/VoiceStatsNavbar/VoiceStatsNavbarItem'
import AutomateStatsNavbar from 'pages/stats/self-service/AutomateStatsNavbar'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

const COMMON_NAV_LINK_PROPS: Partial<NavbarLinkProps> = {
    exact: true,
}

export default function StatsNavbarView() {
    const isHelpCenterAnalyticsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.HelpCenterAnalytics]
    const displayVoiceAnalyticsV1: boolean | undefined =
        useFlags()[FeatureFlagKey.DisplayVoiceAnalyticsV1]
    const isSLAsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsSLAs]

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
                            Busiest times of days
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        data-candu-id="statistics-link-channels"
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
                    {!!isSLAsEnabled && (
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
                                SLAs{' '}
                                <Badge
                                    type={ColorType.Blue}
                                    className={cssNavbar.badge}
                                >
                                    NEW
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
                            Tags
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
                {displayVoiceAnalyticsV1 && (
                    <VoiceStatsNavbarItem
                        to={'/app/stats/voice-agents'}
                        title={'Agents'}
                        commonNavLinkProps={COMMON_NAV_LINK_PROPS}
                    />
                )}
            </NavbarBlock>
        </>
    )
}
