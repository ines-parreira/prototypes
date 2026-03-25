import { useMemo } from 'react'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { UserRole } from '@repo/utils'

import { ActiveContent, Navbar } from 'common/navigation'
import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'

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
    const { hasAccess, isLoading } = useAiAgentAccess()
    const integrations = useStoreIntegrations()

    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            Object.values(Sections),
        )

    const onCategoryChange = (values: AccordionValues) => {
        setExpandedCategories(values)
    }

    const shouldRender = useMemo(
        () => hasAccess && integrations.length > 0 && !isLoading,
        [hasAccess, integrations, isLoading],
    )

    const shouldRenderAutomate = useMemo(
        () => (!hasAccess || integrations.length === 0) && !isLoading,
        [hasAccess, integrations, isLoading],
    )

    // If there is no usage of article recommendations during the last month,
    // for any of stores, we will not show the them in the settings navbar.
    const { enabledInSettings: isArticleRecEnabledWhileSunset } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()

    const isHistoricalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)
    const { isStandaloneAiAgent } = useStandaloneAiContext()

    return (
        <Navbar activeContent={ActiveContent.Settings} title="Settings">
            <Navigation.Root
                className={css.wrapper}
                value={expandedCategories}
                onValueChange={onCategoryChange}
            >
                {!isStandaloneAiAgent && (
                    <>
                        <Section
                            id="productivity"
                            value={Sections.Productivity}
                        >
                            <Navigation.SectionContent
                                className={css.sectionContent}
                            >
                                <Item to="macros" text="Macros" />
                                <Item
                                    to="flows"
                                    text="Flows"
                                    requiredRole={UserRole.Agent}
                                    shouldRender={shouldRender}
                                />
                                <Item
                                    to="order-management"
                                    text="Order Management"
                                    requiredRole={UserRole.Agent}
                                    shouldRender={shouldRender}
                                />
                                {isArticleRecEnabledWhileSunset && (
                                    <Item
                                        to="article-recommendations"
                                        text="Article Recommendations"
                                        requiredRole={UserRole.Agent}
                                        shouldRender={shouldRender}
                                    />
                                )}
                                <Item
                                    to="automate"
                                    text="AI Agent"
                                    requiredRole={UserRole.Agent}
                                    shouldRender={shouldRenderAutomate}
                                    extra={<AutomateUpgradeBadge />}
                                />
                            </Navigation.SectionContent>
                        </Section>
                        <Section
                            id="ticket-customer-data"
                            value={Sections.Ticket}
                            requiredRole={UserRole.Agent}
                        >
                            <Navigation.SectionContent
                                className={css.sectionContent}
                            >
                                <Item
                                    to={
                                        CUSTOM_FIELD_ROUTES[OBJECT_TYPES.TICKET]
                                    }
                                    text="Ticket Fields"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to={
                                        CUSTOM_FIELD_ROUTES[
                                            OBJECT_TYPES.CUSTOMER
                                        ]
                                    }
                                    text="Customer Fields"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to={CUSTOM_FIELD_CONDITIONS_ROUTE}
                                    text="Field Conditions"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to="manage-tags"
                                    text="Tags"
                                    requiredRole={UserRole.Agent}
                                />
                                <Item
                                    to="sla"
                                    text="SLAs"
                                    requiredRole={UserRole.Agent}
                                />
                                <Item
                                    to="satisfaction-surveys"
                                    text="Satisfaction survey"
                                    requiredRole={UserRole.Admin}
                                />
                            </Navigation.SectionContent>
                        </Section>
                        <Section
                            id="ticket-management"
                            value={Sections.TicketManagement}
                            requiredRole={UserRole.Agent}
                        >
                            <Navigation.SectionContent
                                className={css.sectionContent}
                            >
                                <Item
                                    to="rules"
                                    text="Rules"
                                    requiredRole={UserRole.Agent}
                                />
                                <Item
                                    to="ticket-assignment"
                                    text="Ticket Assignment"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to="auto-merge"
                                    text="Auto-merge"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to="business-hours"
                                    text="Business hours"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to="sidebar"
                                    text="Default views"
                                    requiredRole={UserRole.Admin}
                                />
                            </Navigation.SectionContent>
                        </Section>
                    </>
                )}

                <Section id="channels" value={Sections.Channels}>
                    <Navigation.SectionContent className={css.sectionContent}>
                        {!isStandaloneAiAgent && (
                            <>
                                <Item to="help-center" text="Help Center" />
                                <Item
                                    to="phone-numbers"
                                    text="Phone numbers"
                                    requiredRole={UserRole.Admin}
                                />
                            </>
                        )}

                        <Item
                            to={`channels/${IntegrationType.Email}`}
                            text="Email"
                            requiredRole={UserRole.Admin}
                        />
                        {!isStandaloneAiAgent && (
                            <>
                                <Item
                                    to={`channels/${IntegrationType.Phone}`}
                                    text="Voice"
                                    requiredRole={UserRole.Admin}
                                />
                                <Item
                                    to={`channels/${IntegrationType.Sms}`}
                                    text="SMS"
                                    requiredRole={UserRole.Admin}
                                />
                            </>
                        )}

                        <Item
                            to={`channels/${IntegrationType.GorgiasChat}`}
                            text="Chat"
                            requiredRole={UserRole.Admin}
                        />
                        {!isStandaloneAiAgent && (
                            <Item
                                to="contact-form"
                                text="Contact form"
                                requiredRole={UserRole.Admin}
                            />
                        )}
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="apps"
                    value={Sections.Apps}
                    requiredRole={UserRole.Admin}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="integrations/mine"
                            exact
                            text="Installed apps"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="integrations"
                            exact
                            text="App store"
                            requiredRole={UserRole.Admin}
                        />
                        {!isStandaloneAiAgent && (
                            <Item
                                to={`integrations/${IntegrationType.Http}`}
                                exact
                                text="HTTP integration"
                                requiredRole={UserRole.Admin}
                            />
                        )}
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="account"
                    value={Sections.Account}
                    requiredRole={UserRole.Admin}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="store-management"
                            text="Store Management"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="users"
                            text="Users"
                            requiredRole={UserRole.Admin}
                        />
                        {!isStandaloneAiAgent && (
                            <>
                                <Item
                                    to="teams"
                                    text="Teams"
                                    requiredRole={UserRole.Admin}
                                />
                                {isAgentUnavailabilityEnabled && (
                                    <Item
                                        to="agent-statuses"
                                        text="Agent unavailability"
                                        requiredRole={UserRole.Admin}
                                    />
                                )}
                            </>
                        )}

                        <Item
                            to="access"
                            text="Access management"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="billing"
                            text="Billing & usage"
                            requiredRole={UserRole.Admin}
                            onClick={() =>
                                logEvent(
                                    SegmentEvent.BillingAndUsageNavigationSideNavClicked,
                                )
                            }
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="advanced"
                    value={Sections.Advanced}
                    requiredRole={UserRole.Admin}
                >
                    <Navigation.SectionContent className={css.sectionContent}>
                        <Item
                            to="audit"
                            text="Audit logs"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="api"
                            text="REST API"
                            requiredRole={UserRole.Admin}
                        />
                        {!isStandaloneAiAgent &&
                            (isHistoricalImportsEnabled ? (
                                <Item
                                    to="historical-imports"
                                    text="Imports"
                                    requiredRole={UserRole.Admin}
                                />
                            ) : (
                                <>
                                    <Item
                                        to="import-email"
                                        text="Email Import"
                                        requiredRole={UserRole.Admin}
                                    />
                                    <Item
                                        to="import-zendesk"
                                        text="Zendesk import"
                                        requiredRole={UserRole.Admin}
                                    />
                                </>
                            ))}
                    </Navigation.SectionContent>
                </Section>

                {!isStandaloneAiAgent && (
                    <Section id="profile" value={Sections.Profile}>
                        <Navigation.SectionContent
                            className={css.sectionContent}
                        >
                            <Item to="profile" text="Your profile" />
                            <Item to="notifications" text="Notifications" />
                            <Item to="password-2fa" text="Password & 2FA" />
                        </Navigation.SectionContent>
                    </Section>
                )}
            </Navigation.Root>
        </Navbar>
    )
}

export default SettingsNavbar
