import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import {
    aiAgentRoutes,
    getAiAgentBasePath,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'

import { ActionDrivenNavigationItems } from './ActionDrivenNavigationItems'
import { useActionDrivenNavbarSections } from './useActionDrivenNavbarSections'

import css from './AiAgentNavbar.less'

export const ActionDrivenNavigation = () => {
    const {
        selectedStore,
        selectedStoreIntegration,
        storeIntegrations,
        handleStoreSelect,
        getStoreActivationStatus,
        getChannelStatus,
        navigationItems,
        expandedSections,
        handleExpandedSectionsChange,
    } = useActionDrivenNavbarSections()

    const onboardingState = useAiAgentOnboardingState(selectedStore || '')
    const isOnboarded = onboardingState === OnboardingState.Onboarded
    const flags = useFlags()
    const isActionsInternalPlatformEnabled =
        !!flags[FeatureFlagKey.ActionsInternalPlatform]
    const isActive =
        !!selectedStore &&
        !!getStoreActivationStatus &&
        getStoreActivationStatus(selectedStore)

    return (
        <Navigation.Root
            className={css.navigation}
            value={expandedSections}
            onValueChange={handleExpandedSectionsChange}
        >
            {isActionsInternalPlatformEnabled && (
                <Navigation.SectionItem
                    as={NavLink}
                    to={aiAgentRoutes.actionsPlatform}
                    data-candu-id="ai-agent-navbar-actions-platform"
                >
                    Actions platform
                </Navigation.SectionItem>
            )}
            <div className={css.storeSelector}>
                <StoreSelector
                    integrations={storeIntegrations}
                    selected={selectedStoreIntegration}
                    onChange={(id) => {
                        const integration = storeIntegrations.find(
                            (i) => i.id === id,
                        )
                        if (!integration) return
                        const shopName =
                            getShopNameFromStoreIntegration(integration)
                        handleStoreSelect(shopName)
                    }}
                    shouldShowActiveStatus={(integration) =>
                        getStoreActivationStatus(
                            getShopNameFromStoreIntegration(integration),
                        )
                    }
                    fullWidth
                    singleStoreInline
                    buttonClassName={css.storeSelectorButton}
                    hideSelectedFromDropdown
                />
            </div>

            {selectedStore &&
                onboardingState === OnboardingState.OnboardingWizard &&
                !isActive && (
                    <Navigation.SectionItem
                        as={NavLink}
                        to={getAiAgentBasePath(selectedStore)}
                        exact
                        displayType="indent"
                    >
                        Get Started
                    </Navigation.SectionItem>
                )}

            {selectedStore && (isActive || isOnboarded) && (
                <ActionDrivenNavigationItems
                    navigationItems={navigationItems}
                    selectedStore={selectedStore}
                    getChannelStatus={getChannelStatus}
                />
            )}
        </Navigation.Root>
    )
}
