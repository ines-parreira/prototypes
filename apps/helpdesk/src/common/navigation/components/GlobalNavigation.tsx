import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import cn from 'classnames'
import { Link } from 'react-router-dom'

import css from 'common/navigation/components/GlobalNavigation.less'
import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import { GlobalNavigationSpotlight } from 'common/navigation/components/GlobalNavigationSpotlight'
import { NavBarButtonTooltip } from 'common/navigation/components/NavBarButtonTooltip'
import NotificationsItem from 'common/navigation/components/NotificationsItem'
import UserItem from 'common/navigation/components/UserItem'
import useActiveItem from 'common/navigation/hooks/useActiveItem'
import { MenuItemName } from 'common/navigation/hooks/useMainNavigationItems'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { useNavBarMenuIcon } from 'common/navigation/hooks/useNavBarMenuIcon'
import { useNavBarShortcuts } from 'common/navigation/hooks/useNavBarShortcuts'
import { UserRole } from 'config/types/user'
import { useTheme } from 'core/theme'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import useAppSelector from 'hooks/useAppSelector'
import { useHasAiAgentMenu } from 'pages/aiAgent/hooks/useHasAiAgentMenu'
import { BASE_STATS_PATH, BASE_VOICE_OF_CUSTOMER_PATH } from 'routes/constants'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export default function GlobalNavigation() {
    const theme = useTheme()
    const currentUser = useAppSelector(getCurrentUser)
    const activeItem = useActiveItem()
    const navBarMenuIcon = useNavBarMenuIcon()
    const { onMenuToggle, onNavHover, onNavLeave } = useNavBar()
    const isAutomateRevampEnabled = useFlag(
        FeatureFlagKey.AutomateSettingsRevamp,
    )
    const isAiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled)

    const { isModuleRestrictedToCurrentUser } = useReportChartRestrictions()
    const isAccessRestrictedToStatistics =
        isModuleRestrictedToCurrentUser(BASE_STATS_PATH)
    const isVoiceOfCustomerRestricted = isModuleRestrictedToCurrentUser(
        BASE_VOICE_OF_CUSTOMER_PATH,
    )
    const hasAiAgentMenu = useHasAiAgentMenu()

    useNavBarShortcuts()

    return (
        <nav
            className={cn(css.container, {
                dark: theme.resolvedName === 'classic',
            })}
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
                        as={Link}
                        icon="home"
                        label="Home"
                        isActive={activeItem === 'home'}
                        tooltip={<span>Home</span>}
                        to="/app/home"
                        data-candu-id="global-navigation-menu-home-page"
                    />
                    <GlobalNavigationSpotlight />
                    <NotificationsItem />
                </div>
                <hr className={css.separator} />
                <div className={css.items}>
                    <GlobalNavigationItem
                        as={Link}
                        icon="question_answer"
                        label="Tickets"
                        isActive={activeItem === 'tickets'}
                        tooltip={<span>Tickets</span>}
                        to="/app/tickets"
                        data-candu-id="global-navigation-menu-tickets-page"
                    />
                    {!isAutomateRevampEnabled &&
                        hasRole(currentUser, UserRole.Agent) && (
                            <GlobalNavigationItem
                                as={Link}
                                icon="bolt"
                                label="AI Agent"
                                isActive={activeItem === 'automate'}
                                tooltip={<span>AI Agent</span>}
                                to="/app/automation"
                                data-candu-id="global-navigation-menu-automation-page"
                            />
                        )}
                    {hasAiAgentMenu && hasRole(currentUser, UserRole.Agent) && (
                        <GlobalNavigationItem
                            as={Link}
                            icon="auto_awesome"
                            label="AI Agent"
                            isActive={activeItem === MenuItemName.AiAgent}
                            tooltip={<span>AI Agent</span>}
                            to="/app/ai-agent"
                            data-candu-id="global-navigation-menu-ai-agent-page"
                        />
                    )}
                    {isAiJourneyEnabled && (
                        <GlobalNavigationItem
                            as={Link}
                            icon="route"
                            label="AI Journey"
                            isActive={activeItem === MenuItemName.AiJourney}
                            tooltip={<span>AI Journey</span>}
                            to="/app/ai-journey"
                            data-candu-id="global-navigation-menu-ai-journey-page"
                        />
                    )}
                    {hasRole(currentUser, UserRole.Admin) && (
                        <GlobalNavigationItem
                            as={Link}
                            icon="monetization_on"
                            label="Convert"
                            isActive={activeItem === 'convert'}
                            tooltip={<span>Convert</span>}
                            to="/app/convert"
                            data-candu-id="global-navigation-menu-convert-page"
                        />
                    )}
                    <GlobalNavigationItem
                        as={Link}
                        icon="people"
                        label="Customers"
                        isActive={activeItem === 'customers'}
                        tooltip={<span>Customers</span>}
                        to="/app/customers"
                        data-candu-id="global-navigation-menu-customers-page"
                    />
                    {!isAccessRestrictedToStatistics && (
                        <GlobalNavigationItem
                            as={Link}
                            icon="bar_chart"
                            label="Statistics"
                            isActive={activeItem === MenuItemName.Statistics}
                            tooltip={<span>Statistics</span>}
                            to={BASE_STATS_PATH}
                            data-candu-id="global-navigation-menu-statistics-page"
                        />
                    )}
                    {!isVoiceOfCustomerRestricted && (
                        <GlobalNavigationItem
                            as={Link}
                            icon="psychology"
                            label="Statistics"
                            isActive={
                                activeItem === MenuItemName.VoiceOfCustomer
                            }
                            tooltip={<span>Voice of Customer</span>}
                            to={BASE_VOICE_OF_CUSTOMER_PATH}
                            data-candu-id="global-navigation-menu-voice-of-customer-page"
                        />
                    )}
                </div>
            </section>
            <section className={css.section}>
                <div className={css.items}>
                    <GlobalNavigationItem
                        as={Link}
                        icon="settings"
                        label="Settings"
                        isActive={activeItem === 'settings'}
                        tooltip={<span>Settings</span>}
                        to="/app/settings"
                        data-candu-id="global-navigation-menu-settings-page"
                    />
                    <UserItem />
                </div>
            </section>
        </nav>
    )
}
