import { useMemo } from 'react'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
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

import { AutomateUpgradeBadge, Sections } from './config'
import Item from './Item'
import Section from './Section'

import css from './NewUI.less'

const NewUI = () => {
    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            Object.values(Sections),
        )

    const onCategoryChange = (values: AccordionValues) => {
        setExpandedCategories(values)
    }

    const hasAutomate = useAppSelector(getHasAutomate)
    const integrations = useStoreIntegrations()

    const shouldRender = useMemo(
        () => hasAutomate && integrations.length > 0,
        [hasAutomate, integrations],
    )

    const shouldRenderAutomate = useMemo(
        () => !hasAutomate || integrations.length === 0,
        [hasAutomate, integrations],
    )

    return (
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
                        text="Automate"
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
                    />
                    <Item
                        to={CUSTOM_FIELD_CONDITIONS_ROUTE}
                        text="Field Conditions"
                        requiredRole={ADMIN_ROLE}
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
                    <Item to="rules" text="Rules" requiredRole={AGENT_ROLE} />
                    <Item
                        to="ticket-assignment"
                        text="Routing"
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
                        text="Sidebar"
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

            <Section id="apps" value={Sections.Apps} requiredRole={ADMIN_ROLE}>
                <Navigation.SectionContent className={css.sectionContent}>
                    <Item
                        to="integrations/mine"
                        text="Installed apps"
                        requiredRole={ADMIN_ROLE}
                    />
                    <Item
                        to="integrations"
                        text="App store"
                        requiredRole={ADMIN_ROLE}
                    />
                    <Item
                        to={`integrations/${IntegrationType.Http}`}
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
                    <Item to="users" text="Users" requiredRole={ADMIN_ROLE} />
                    <Item to="teams" text="Teams" requiredRole={ADMIN_ROLE} />
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
                    <Item to="api" text="REST API" requiredRole={ADMIN_ROLE} />
                    <Item
                        to="import-data"
                        text="Import data"
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
    )
}

export default NewUI
