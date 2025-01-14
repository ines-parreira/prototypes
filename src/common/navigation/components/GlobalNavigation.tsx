import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import useActiveItem from '../hooks/useActiveItem'
import css from './GlobalNavigation.less'
import Item from './GlobalNavigationItem'
import {GlobalNavigationSpotlight} from './GlobalNavigationSpotlight'
import NotificationsItem from './NotificationsItem'
import UserItem from './UserItem'

export default function GlobalNavigation() {
    const currentUser = useAppSelector(getCurrentUser)
    const activeItem = useActiveItem()

    return (
        <nav className={css.container}>
            <section className={css.section}>
                <div className={css.items}>
                    <Item
                        icon="home"
                        isActive={activeItem === 'home'}
                        tooltip={<span>Home</span>}
                        url="/app/home"
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
                    />
                    {hasRole(currentUser, UserRole.Agent) && (
                        <Item
                            icon="bolt"
                            isActive={activeItem === 'automate'}
                            tooltip={<span>Automate</span>}
                            url="/app/automation"
                        />
                    )}
                    {hasRole(currentUser, UserRole.Admin) && (
                        <Item
                            icon="monetization_on"
                            isActive={activeItem === 'convert'}
                            tooltip={<span>Convert</span>}
                            url="/app/convert"
                        />
                    )}
                    <Item
                        icon="people"
                        isActive={activeItem === 'customers'}
                        tooltip={<span>Customers</span>}
                        url="/app/customers"
                    />
                    <Item
                        icon="bar_chart"
                        isActive={activeItem === 'statistics'}
                        tooltip={<span>Statistics</span>}
                        url="/app/stats"
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
                    />
                    <UserItem />
                </div>
            </section>
        </nav>
    )
}
