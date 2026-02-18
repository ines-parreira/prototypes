import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { UserRole } from '@repo/utils'

import { ActiveContent, Navbar } from 'common/navigation'
import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import { IntegrationType } from 'models/integration/types'
import Item from 'pages/settings/common/SettingsNavbar/Item'
import Section from 'pages/settings/common/SettingsNavbar/Section'

const Sections = {
    Apps: 'Apps',
    Workspace: 'Workspace',
    Channels: 'Channels',
    Account: 'Account',
} as const

export function SettingsSidebar() {
    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            Object.values(Sections),
        )

    const onCategoryChange = (values: AccordionValues) => {
        setExpandedCategories(values)
    }

    const isAgentUnavailabilityEnabled = useFlag(
        FeatureFlagKey.CustomAgentUnavailableStatuses,
    )

    const isHistoricalImportsEnabled = useFlag(FeatureFlagKey.HistoricalImports)

    return (
        <Navbar activeContent={ActiveContent.Settings}>
            <Navigation.Root
                value={expandedCategories}
                onValueChange={onCategoryChange}
            >
                <Section
                    id="apps"
                    value={Sections.Apps}
                    requiredRole={UserRole.Admin}
                >
                    <Navigation.SectionContent>
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
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="workspace"
                    value={Sections.Workspace}
                    requiredRole={UserRole.Agent}
                >
                    <Navigation.SectionContent>
                        <Item
                            to="store-management"
                            text="Store"
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

                <Section id="channels" value={Sections.Channels}>
                    <Navigation.SectionContent>
                        <Item to="help-center" text="Help Center" />
                        <Item
                            to="phone-numbers"
                            text="Phone numbers"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to={`channels/${IntegrationType.Email}`}
                            text="Email"
                            requiredRole={UserRole.Admin}
                        />
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
                        <Item
                            to={`channels/${IntegrationType.GorgiasChat}`}
                            text="Chat"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="contact-form"
                            text="Contact form"
                            requiredRole={UserRole.Admin}
                        />
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="account"
                    value={Sections.Account}
                    requiredRole={UserRole.Admin}
                >
                    <Navigation.SectionContent>
                        <Item
                            to="users"
                            text="Users"
                            requiredRole={UserRole.Admin}
                        />
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

                        {/* HTTP integration and REST API will be merged as Custom Integrations */}
                        <Item
                            to={`integrations/${IntegrationType.Http}`}
                            exact
                            text="HTTP integration"
                            requiredRole={UserRole.Admin}
                        />
                        <Item
                            to="api"
                            text="REST API"
                            requiredRole={UserRole.Admin}
                        />

                        <Item
                            to="audit"
                            text="Audit logs"
                            requiredRole={UserRole.Admin}
                        />
                        {isHistoricalImportsEnabled ? (
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
                        )}
                        <Item to="password-2fa" text="Password & 2FA" />
                    </Navigation.SectionContent>
                </Section>
            </Navigation.Root>
        </Navbar>
    )
}
