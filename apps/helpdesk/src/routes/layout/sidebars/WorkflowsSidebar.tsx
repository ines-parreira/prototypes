import type { ComponentProps } from 'react'
import { useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { UserRole } from '@repo/utils'

import { ActiveContent, Navbar } from 'common/navigation'
import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import SettingsNavbarItem from 'pages/settings/common/SettingsNavbar/Item'
import Section from 'pages/settings/common/SettingsNavbar/Section'
import {
    workflowsRoutes as routes,
    WORKFLOWS_DEFAULT_PATH,
    WorkflowsRoute,
} from 'routes/layout/products/workflows'

const Sections = {
    Tools: 'Tools',
    FieldsAndTags: 'Fields and Tags',
} as const

export function WorkflowsSidebar() {
    const { hasAccess: hasAIAgentAccess, isLoading } = useAiAgentAccess()
    const integrations = useStoreIntegrations()

    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            Object.values(Sections),
        )

    const onCategoryChange = (values: AccordionValues) => {
        setExpandedCategories(values)
    }

    const shouldRenderAiAgentRelatedItems = useMemo(
        () => hasAIAgentAccess && integrations.length > 0 && !isLoading,
        [hasAIAgentAccess, integrations, isLoading],
    )

    // If there is no usage of article recommendations during the last month,
    // for any of stores, we will not show the them in the settings navbar.
    const { enabledInSettings: isArticleRecEnabledWhileSunset } =
        useIsArticleRecommendationsEnabledWhileSunset()

    return (
        <Navbar activeContent={ActiveContent.Settings} title="Settings">
            <Navigation.Root
                value={expandedCategories}
                onValueChange={onCategoryChange}
            >
                <Section id="tools" value={Sections.Tools}>
                    <Navigation.SectionContent>
                        <Item
                            to={routes[WorkflowsRoute.Flows].path}
                            text={routes[WorkflowsRoute.Flows].label}
                            requiredRole={
                                routes[WorkflowsRoute.Flows].requiredRole
                            }
                            shouldRender={shouldRenderAiAgentRelatedItems}
                        />
                        <Item
                            to={routes[WorkflowsRoute.OrderManagement].path}
                            text={routes[WorkflowsRoute.OrderManagement].label}
                            requiredRole={
                                routes[WorkflowsRoute.OrderManagement]
                                    .requiredRole
                            }
                            shouldRender={shouldRenderAiAgentRelatedItems}
                        />
                        <Item
                            to={routes[WorkflowsRoute.Rules].path}
                            text={routes[WorkflowsRoute.Rules].label}
                            requiredRole={
                                routes[WorkflowsRoute.Rules].requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.Macros].path}
                            text={routes[WorkflowsRoute.Macros].label}
                            requiredRole={
                                routes[WorkflowsRoute.Macros].requiredRole
                            }
                        />

                        {/* Ticket assignment and auto-merge will be merged into a single page */}
                        <Item
                            to={routes[WorkflowsRoute.TicketAssignment].path}
                            text={routes[WorkflowsRoute.TicketAssignment].label}
                            requiredRole={
                                routes[WorkflowsRoute.TicketAssignment]
                                    .requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.AutoMerge].path}
                            text={routes[WorkflowsRoute.AutoMerge].label}
                            requiredRole={
                                routes[WorkflowsRoute.AutoMerge].requiredRole
                            }
                        />

                        <Item
                            to={routes[WorkflowsRoute.CSAT].path}
                            text={routes[WorkflowsRoute.CSAT].label}
                            requiredRole={
                                routes[WorkflowsRoute.CSAT].requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.SLA].path}
                            text={routes[WorkflowsRoute.SLA].label}
                            requiredRole={
                                routes[WorkflowsRoute.SLA].requiredRole
                            }
                        />
                        {isArticleRecEnabledWhileSunset && (
                            <Item
                                to={
                                    routes[
                                        WorkflowsRoute.ArticleRecommendations
                                    ].path
                                }
                                text={
                                    routes[
                                        WorkflowsRoute.ArticleRecommendations
                                    ].label
                                }
                                requiredRole={
                                    routes[
                                        WorkflowsRoute.ArticleRecommendations
                                    ].requiredRole
                                }
                                shouldRender={shouldRenderAiAgentRelatedItems}
                            />
                        )}
                    </Navigation.SectionContent>
                </Section>

                <Section
                    id="fields-and-tags"
                    value={Sections.FieldsAndTags}
                    requiredRole={UserRole.Agent}
                >
                    <Navigation.SectionContent>
                        <Item
                            to={routes[WorkflowsRoute.TicketFields].path}
                            text={routes[WorkflowsRoute.TicketFields].label}
                            requiredRole={
                                routes[WorkflowsRoute.TicketFields].requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.CustomerFields].path}
                            text={routes[WorkflowsRoute.CustomerFields].label}
                            requiredRole={
                                routes[WorkflowsRoute.CustomerFields]
                                    .requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.FieldConditions].path}
                            text={routes[WorkflowsRoute.FieldConditions].label}
                            requiredRole={
                                routes[WorkflowsRoute.FieldConditions]
                                    .requiredRole
                            }
                        />
                        <Item
                            to={routes[WorkflowsRoute.Tags].path}
                            text={routes[WorkflowsRoute.Tags].label}
                            requiredRole={
                                routes[WorkflowsRoute.Tags].requiredRole
                            }
                        />
                    </Navigation.SectionContent>
                </Section>
            </Navigation.Root>
        </Navbar>
    )
}

function Item(props: ComponentProps<typeof SettingsNavbarItem>) {
    return (
        <SettingsNavbarItem
            {...props}
            rootPath={`${WORKFLOWS_DEFAULT_PATH}/`}
        />
    )
}
