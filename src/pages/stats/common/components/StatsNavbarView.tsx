import React, {ComponentProps} from 'react'
import {NavLink} from 'react-router-dom'

import css from 'assets/css/navbar.less'
import NavbarBlock from 'pages/common/components/navbar/NavbarBlock'

const COMMON_NAV_LINK_PROPS: Partial<ComponentProps<NavLink>> = {
    className: css.link,
    activeClassName: 'active',
    exact: true,
}

export default function StatsNavbarView() {
    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={css.menu}>
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
                <div className={css.menu}>
                    <NavLink
                        {...COMMON_NAV_LINK_PROPS}
                        to="/app/stats/support-performance-overview"
                    >
                        Overview
                    </NavLink>
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
                <div className={css.menu}>
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
