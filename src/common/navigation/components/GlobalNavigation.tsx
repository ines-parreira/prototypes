import React from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
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

    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentStandaloneMenu = useFlag<boolean>(
        FeatureFlagKey.ConvAiStandaloneMenu,
        false
    )
    const hasAiAgentPreview = useFlag<boolean>(
        FeatureFlagKey.AIAgentPreviewModeAllowed,
        false
    )
    const isAiAgentItemEnabled =
        hasAiAgentStandaloneMenu && (hasAutomate || hasAiAgentPreview)

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
                    {isAiAgentItemEnabled &&
                        hasRole(currentUser, UserRole.Agent) && (
                            <Item
                                icon="auto_awesome"
                                isActive={activeItem === 'ai-agent'}
                                url="/app/ai-agent"
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
