import css from 'common/navigation/components/GlobalNavigation.less'
import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import { GlobalNavigationSpotlight } from 'common/navigation/components/GlobalNavigationSpotlight'
import { NavBarButtonTooltip } from 'common/navigation/components/NavBarButtonTooltip'
import NotificationsItem from 'common/navigation/components/NotificationsItem'
import UserItem from 'common/navigation/components/UserItem'
import useActiveItem from 'common/navigation/hooks/useActiveItem'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { useNavBarMenuIcon } from 'common/navigation/hooks/useNavBarMenuIcon'
import { useNavBarShortcuts } from 'common/navigation/hooks/useNavBarShortcuts'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useHasShopifyIntegration } from 'hooks/useHasShopifyIntegration'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { BASE_STATS_PATH } from 'routes/constants'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export default function GlobalNavigation() {
    const currentUser = useAppSelector(getCurrentUser)
    const activeItem = useActiveItem()
    const navBarMenuIcon = useNavBarMenuIcon()
    const { onMenuToggle, onNavHover, onNavLeave } = useNavBar()
    const isAutomateRevampEnabled = useFlag(
        FeatureFlagKey.AutomateSettingsRevamp,
    )

    const { isModuleRestrictedToCurrentUser } = useReportChartRestrictions()
    const isAccessRestrictedToStatistics =
        isModuleRestrictedToCurrentUser(BASE_STATS_PATH)
    const hasShopifyIntegration = useHasShopifyIntegration()

    useNavBarShortcuts()

    return (
        <nav
            className={css.container}
            onMouseOver={onNavHover}
            onMouseLeave={onNavLeave}
            onFocus={onNavHover}
        >
            <section className={css.section}>
                <div className={css.items}>
                    <GlobalNavigationItem
                        icon={navBarMenuIcon}
                        onClick={onMenuToggle}
                        label="Menu"
                        tooltip={<NavBarButtonTooltip />}
                        data-candu-id="global-navigation-menu-toggle"
                    />
                    <GlobalNavigationItem
                        icon="home"
                        label="Home"
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
                    <GlobalNavigationItem
                        icon="question_answer"
                        label="Tickets"
                        isActive={activeItem === 'tickets'}
                        tooltip={<span>Tickets</span>}
                        url="/app/tickets"
                        data-candu-id="global-navigation-menu-tickets-page"
                    />
                    {!isAutomateRevampEnabled &&
                        hasRole(currentUser, UserRole.Agent) && (
                            <GlobalNavigationItem
                                icon="bolt"
                                label="Automate"
                                isActive={activeItem === 'automate'}
                                tooltip={<span>Automate</span>}
                                url="/app/automation"
                                data-candu-id="global-navigation-menu-automation-page"
                            />
                        )}
                    {hasShopifyIntegration &&
                        hasRole(currentUser, UserRole.Agent) && (
                            <GlobalNavigationItem
                                icon="auto_awesome"
                                label="AI Agent"
                                isActive={activeItem === 'ai-agent'}
                                tooltip={<span>AI Agent</span>}
                                url="/app/ai-agent"
                                data-candu-id="global-navigation-menu-ai-agent-page"
                            />
                        )}
                    {hasRole(currentUser, UserRole.Admin) && (
                        <GlobalNavigationItem
                            icon="monetization_on"
                            label="Convert"
                            isActive={activeItem === 'convert'}
                            tooltip={<span>Convert</span>}
                            url="/app/convert"
                            data-candu-id="global-navigation-menu-convert-page"
                        />
                    )}
                    <GlobalNavigationItem
                        icon="people"
                        label="Customers"
                        isActive={activeItem === 'customers'}
                        tooltip={<span>Customers</span>}
                        url="/app/customers"
                        data-candu-id="global-navigation-menu-customers-page"
                    />
                    {!isAccessRestrictedToStatistics && (
                        <GlobalNavigationItem
                            icon="bar_chart"
                            label="Statistics"
                            isActive={activeItem === 'statistics'}
                            tooltip={<span>Statistics</span>}
                            url={BASE_STATS_PATH}
                            data-candu-id="global-navigation-menu-statistics-page"
                        />
                    )}
                </div>
            </section>
            <section className={css.section}>
                <div className={css.items}>
                    <GlobalNavigationItem
                        icon="settings"
                        label="Settings"
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
