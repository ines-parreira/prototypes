import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { NavLink } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { ShoppingAssistantPromoCard } from '../ShoppingAssistant/ShoppingAssistantPromoCard'
import { AiAgentNavbarSectionBlock } from './AiAgentNavbarSectionBlock'
import { useAiAgentNavbarSections } from './useAiAgentNavbarSections'
import { getSectionKeyFromStoreIntegration } from './utils'

import css from './AiAgentNavbar.less'

export const AiAgentNavbar = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const { sections, handleNavigationStateChange } = useAiAgentNavbarSections()

    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )

    if (
        (!hasAutomate && !hasAiAgentPreview) ||
        storeIntegrations.length === 0
    ) {
        return <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent" />
    }

    return (
        <Navbar activeContent={ActiveContent.AiAgent} title="AI Agent">
            <div className={css.container}>
                <div className={css.scrollableContent}>
                    <Navigation.Root
                        className={css.navigation}
                        value={sections}
                        onValueChange={handleNavigationStateChange}
                    >
                        <Navigation.SectionItem
                            as={NavLink}
                            to={aiAgentRoutes.overview}
                            data-candu-id="ai-agent-navbar-overview"
                        >
                            Overview
                        </Navigation.SectionItem>
                        {isActionsInternalPlatformEnabled && (
                            <Navigation.SectionItem
                                as={NavLink}
                                to={aiAgentRoutes.actionsPlatform}
                                data-candu-id="ai-agent-navbar-actions-platform"
                            >
                                Actions platform
                            </Navigation.SectionItem>
                        )}
                        {storeIntegrations.map((storeIntegration, index) => {
                            const shopType = storeIntegration.type
                            const shopName =
                                getShopNameFromStoreIntegration(
                                    storeIntegration,
                                )

                            return (
                                <AiAgentNavbarSectionBlock
                                    key={`${shopType}:${shopName}`}
                                    name={storeIntegration.name}
                                    shopType={shopType}
                                    shopName={shopName}
                                    shopKey={getSectionKeyFromStoreIntegration(
                                        storeIntegration,
                                    )}
                                    index={index}
                                />
                            )
                        })}
                    </Navigation.Root>
                </div>
                <div className={css.stickyPromoCard}>
                    <ShoppingAssistantPromoCard className={css.promoCard} />
                </div>
            </div>
        </Navbar>
    )
}
