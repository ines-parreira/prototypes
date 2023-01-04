import React, {ComponentProps} from 'react'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'

import css from './StatsNavbarView.less'

const COMMON_NAV_LINK_PROPS: Partial<ComponentProps<NavLink>> = {
    className: classnames(cssNavbar.link, css.link),
    activeClassName: 'active',
    exact: true,
}

export default function StatsNavbarView() {
    const hasAnalyticsBeta: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsBetaTesters]

    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={cssNavbar.menu}>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/live-overview"
                    >
                        Overview
                    </NavLink>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/live-agents"
                    >
                        Agents
                    </NavLink>
                </div>
            </NavbarBlock>
            <NavbarBlock icon="insights" title="Support Performance">
                <div className={cssNavbar.menu}>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/support-performance-overview"
                    >
                        Overview
                        {hasAnalyticsBeta && (
                            <Badge className={css.badge} type={ColorType.Blue}>
                                new
                            </Badge>
                        )}
                    </NavLink>

                    {hasAnalyticsBeta && (
                        <NavLink
                            {...COMMON_NAV_LINK_PROPS}
                            to="/app/stats/weekly-ticket-load"
                        >
                            Weekly ticket load
                        </NavLink>
                    )}

                    <NavLink {...COMMON_NAV_LINK_PROPS} to="/app/stats/tags">
                        Tags
                    </NavLink>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/channels"
                    >
                        Channels
                    </NavLink>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/support-performance-agents"
                    >
                        Agents
                    </NavLink>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/satisfaction"
                    >
                        Satisfaction
                    </NavLink>
                    <NavLink {...COMMON_NAV_LINK_PROPS} to="/app/stats/revenue">
                        Revenue
                    </NavLink>
                </div>
            </NavbarBlock>
            <NavbarBlock icon="bolt" title="Automations">
                <div className={cssNavbar.menu}>
                    {
                        // TMP: This link will come back when the page will be reworked
                        // <NavLink
                        //     {...COMMON_NAV_LINK_PROPS}
                        //     to="/app/stats/automation"
                        // >
                        //     Overview
                        // </NavLink>
                    }
                    <NavLink {...COMMON_NAV_LINK_PROPS} to="/app/stats/macros">
                        Macros
                    </NavLink>
                    <NavLink {...COMMON_NAV_LINK_PROPS} to="/app/stats/intents">
                        Intents
                    </NavLink>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/self-service"
                    >
                        Self-service
                    </NavLink>
                </div>
            </NavbarBlock>
        </>
    )
}
