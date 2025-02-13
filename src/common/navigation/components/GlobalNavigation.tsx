import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {useAiAgentItemEnabled} from 'pages/aiAgent/hooks/useAiAgentItemEnabled'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import useActiveItem from '../hooks/useActiveItem'
import {useNavBar} from '../hooks/useNavBar/useNavBar'
import {useNavBarMenuIcon} from '../hooks/useNavBarMenuIcon'
import {useNavBarShortcuts} from '../hooks/useNavBarShortcuts'
import css from './GlobalNavigation.less'
import Item from './GlobalNavigationItem'
import {GlobalNavigationSpotlight} from './GlobalNavigationSpotlight'
import {NavBarButtonTooltip} from './NavBarButtonTooltip'

import NotificationsItem from './NotificationsItem'
import UserItem from './UserItem'

export default function GlobalNavigation() {
    const currentUser = useAppSelector(getCurrentUser)
    const activeItem = useActiveItem()
    const navBarMenuIcon = useNavBarMenuIcon()
    const {onMenuToggle, onNavHover, onNavLeave} = useNavBar()

    useNavBarShortcuts()

    const isAiAgentItemEnabled = useAiAgentItemEnabled()

    return (
        <nav
            className={css.container}
            onMouseOver={onNavHover}
            onMouseLeave={onNavLeave}
            onFocus={onNavHover}
        >
            <section className={css.section}>
                <div className={css.items}>
                    <Item
                        icon={navBarMenuIcon}
                        onClick={onMenuToggle}
                        tooltip={<NavBarButtonTooltip />}
                        data-candu-id="global-navigation-menu-toggle"
                    />
                    <Item
                        icon="home"
                        isActive={activeItem === 'home'}
                        tooltip={<span>Home</span>}
                        url="/app/home"
                        data-candu-id="global-navigation-menu-home-page"
                    />
                    <GlobalNavigationSpotlight />
                    <NotificationsItem />
                </div>
                <hr className={css.separator} />
                <div className={css.items}>
                    <Item
                        icon="question_answer"
                        isActive={activeItem === 'tickets'}
                        tooltip={<span>Tickets</span>}
                        url="/app/tickets"
                        data-candu-id="global-navigation-menu-tickets-page"
                    />
                    {hasRole(currentUser, UserRole.Agent) && (
                        <Item
                            icon="bolt"
                            isActive={activeItem === 'automate'}
                            tooltip={<span>Automate</span>}
                            url="/app/automation"
                            data-candu-id="global-navigation-menu-automation-page"
                        />
                    )}
                    {isAiAgentItemEnabled &&
                        hasRole(currentUser, UserRole.Agent) && (
                            <Item
                                icon="auto_awesome"
                                isActive={activeItem === 'ai-agent'}
                                tooltip={<span>AI Agent</span>}
                                url="/app/ai-agent"
                                data-candu-id="global-navigation-menu-ai-agent-page"
                            />
                        )}
                    {hasRole(currentUser, UserRole.Admin) && (
                        <Item
                            icon="monetization_on"
                            isActive={activeItem === 'convert'}
                            tooltip={<span>Convert</span>}
                            url="/app/convert"
                            data-candu-id="global-navigation-menu-convert-page"
                        />
                    )}
                    <Item
                        icon="people"
                        isActive={activeItem === 'customers'}
                        tooltip={<span>Customers</span>}
                        url="/app/customers"
                        data-candu-id="global-navigation-menu-customers-page"
                    />
                    <Item
                        icon="bar_chart"
                        isActive={activeItem === 'statistics'}
                        tooltip={<span>Statistics</span>}
                        url="/app/stats"
                        data-candu-id="global-navigation-menu-statistics-page"
                    />
                </div>
            </section>
            <section className={css.section}>
                <div className={css.items}>
                    <Item
                        icon="settings"
                        isActive={activeItem === 'settings'}
                        tooltip={<span>Settings</span>}
                        url="/app/settings"
                        data-candu-id="global-navigation-menu-settings-page"
                    />
                    <UserItem />
                </div>
            </section>
        </nav>
    )
}
