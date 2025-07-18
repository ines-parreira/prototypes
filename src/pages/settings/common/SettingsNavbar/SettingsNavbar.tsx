import { useMemo } from 'react'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { ActiveContent, Navbar } from 'common/navigation'
import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import { useFlag } from 'core/flags'
import { OBJECT_TYPES } from 'custom-fields/constants'
import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import { IntegrationType } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'

import { AutomateUpgradeBadge } from './AutomateUpgradeBadge'
import Item from './Item'
import Section from './Section'

import css from './SettingsNavbar.less'

const Sections = {
    Productivity: 'Productivity',
    Ticket: 'Ticket & Customer data',
    TicketManagement: 'Ticket management',
    Channels: 'Channels',
    Apps: 'Apps',
    Account: 'Account',
    Advanced: 'Advanced',
    Profile: 'Profile',
} as const

const SettingsNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const integrations = useStoreIntegrations()
    const isEmailImportEnabled = useFlag(
        FeatureFlagKey.HistoricalImports,
        false,
    )

    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            Object.values(Sections),
        )

    const onCategoryChange = (values: AccordionValues) => {
        setExpandedCategories(values)
    }

    const shouldRender = useMemo(
        () => hasAutomate && integrations.length > 0,
        [hasAutomate, integrations],
    )

    const shouldRenderAutomate = useMemo(
        () => !hasAutomate || integrations.length === 0,
        [hasAutomate, integrations],
    )

    return (
        <Navbar activeContent={ActiveContent.Settings} title="Settings">
            <Navigation.Root
                className={css.wrapper}
                value={expandedCategories}
                onValueChange={onCategoryChange}
            >
                <Section id="productivity" value={Sections.Productivity}>
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item to="macros" text="Macros" />
                        <Item
                            to="flows"
                            text="Flows"
                            requiredRole={AGENT_ROLE}
                            shouldRender={shouldRender}
                        />
                        <Item
                            to="order-management"
                            text="Order Management"
                            requiredRole={AGENT_ROLE}
                            shouldRender={shouldRender}
                        />
                        <Item
                            to="article-recommendations"
                            text="Article Recommendations"
                            requiredRole={AGENT_ROLE}
                            shouldRender={shouldRender}
                        />
                        <Item
                            to="automate"
                            text="AI Agent"
                            requiredRole={AGENT_ROLE}
                            shouldRender={shouldRenderAutomate}
                            extra={<AutomateUpgradeBadge />}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="ticket-customer-data"
                    value={Sections.Ticket}
                    requiredRole={AGENT_ROLE}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to={CUSTOM_FIELD_ROUTES[OBJECT_TYPES.TICKET]}
                            text="Ticket Fields"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER]}
                            text="Customer Fields"
                            requiredRole={ADMIN_ROLE}
                            extra={
                                <Badge
                                    type={'blue'}
                                    className={cssNavbar.badge}
                                >
                                    BETA
                                </Badge>
                            }
                        />
                        <Item
                            to={CUSTOM_FIELD_CONDITIONS_ROUTE}
                            text="Field Conditions"
                            requiredRole={ADMIN_ROLE}
                            extra={
                                <Badge
                                    type={'blue'}
                                    className={cssNavbar.badge}
                                >
                                    BETA
                                </Badge>
                            }
                        />
                        <Item
                            to="manage-tags"
                            text="Tags"
                            requiredRole={AGENT_ROLE}
                        />
                        <Item to="sla" text="SLAs" requiredRole={AGENT_ROLE} />
                        <Item
                            to="satisfaction-surveys"
                            text="Satisfaction survey"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="ticket-management"
                    value={Sections.TicketManagement}
                    requiredRole={AGENT_ROLE}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="rules"
                            text="Rules"
                            requiredRole={AGENT_ROLE}
                        />
                        <Item
                            to="ticket-assignment"
                            text="Ticket Assignment"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="auto-merge"
                            text="Auto-merge"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="business-hours"
                            text="Business hours"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="sidebar"
                            text="Default views"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section id="channels" value={Sections.Channels}>
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item to="help-center" text="Help Center" />
                        <Item
                            to="phone-numbers"
                            text="Phone numbers"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={`channels/${IntegrationType.Email}`}
                            text="Email"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={`channels/${IntegrationType.Phone}`}
                            text="Voice"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={`channels/${IntegrationType.Sms}`}
                            text="SMS"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={`channels/${IntegrationType.GorgiasChat}`}
                            text="Chat"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="contact-form"
                            text="Contact form"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="apps"
                    value={Sections.Apps}
                    requiredRole={ADMIN_ROLE}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="integrations/mine"
                            exact
                            text="Installed apps"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="integrations"
                            exact
                            text="App store"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to={`integrations/${IntegrationType.Http}`}
                            exact
                            text="HTTP integration"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="account"
                    value={Sections.Account}
                    requiredRole={ADMIN_ROLE}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="store-management"
                            text="Store Management"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="users"
                            text="Users"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="teams"
                            text="Teams"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="access"
                            text="Access management"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="billing"
                            text="Billing & usage"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="advanced"
                    value={Sections.Advanced}
                    requiredRole={ADMIN_ROLE}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="audit"
                            text="Audit logs"
                            requiredRole={ADMIN_ROLE}
                        />
                        <Item
                            to="api"
                            text="REST API"
                            requiredRole={ADMIN_ROLE}
                        />
                        {isEmailImportEnabled && (
                            <Item
                                to="import-email"
                                text="Email Import"
                                requiredRole={ADMIN_ROLE}
                            />
                        )}
                        <Item
                            to="import-zendesk"
                            text="Zendesk import"
                            requiredRole={ADMIN_ROLE}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section id="profile" value={Sections.Profile}>
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item to="profile" text="Your profile" />
                        <Item to="notifications" text="Notifications" />
                        <Item to="password-2fa" text="Password & 2FA" />
                    </Navigation.SectionContent>
                </Section>
            </Navigation.Root>
        </Navbar>
    )
}

export default SettingsNavbar
