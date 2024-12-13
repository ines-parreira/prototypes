import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import useActiveItem from '../hooks/useActiveItem'
import css from './GlobalNavigation.less'
import Item from './GlobalNavigationItem'

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
                        url="/app/home"
                    />
                </div>
                <hr className={css.separator} />
                <div className={css.items}>
                    <Item
                        icon="question_answer"
                        isActive={activeItem === 'tickets'}
                        url="/app/tickets"
                    />
                    {hasRole(currentUser, UserRole.Agent) && (
                        <Item
                            icon="bolt"
                            isActive={activeItem === 'automate'}
                            url="/app/automation"
                        />
                    )}
                    {hasRole(currentUser, UserRole.Admin) && (
                        <Item
                            icon="monetization_on"
                            isActive={activeItem === 'convert'}
                            url="/app/convert"
                        />
                    )}
                    <Item
                        icon="people"
                        isActive={activeItem === 'customers'}
                        url="/app/customers"
                    />
                    <Item
                        icon="bar_chart"
                        isActive={activeItem === 'statistics'}
                        url="/app/stats"
                    />
                </div>
            </section>
            <section className={css.section}>
                <div className={css.items}>
                    <Item
                        icon="settings"
                        isActive={activeItem === 'settings'}
                        url="/app/settings"
                    />
                </div>
            </section>
        </nav>
    )
}
