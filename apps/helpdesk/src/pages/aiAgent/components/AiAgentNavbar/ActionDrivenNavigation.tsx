import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { useFlag } from 'core/flags'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import {
    aiAgentRoutes,
    getAiAgentBasePath,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
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

    const {
        hasCurrentStoreTrialOptedOut,
        hasCurrentStoreTrialExpired,
        hasCurrentStoreTrialStarted,
    } = useTrialAccess(selectedStore)

    const onboardingState = useAiAgentOnboardingState(selectedStore || '')
    const isOnboarded = onboardingState === OnboardingState.Onboarded
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )
    const isActive =
        !!selectedStore &&
        !!getStoreActivationStatus &&
        getStoreActivationStatus(selectedStore)
    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const hasTrial =
        hasCurrentStoreTrialStarted ||
        hasCurrentStoreTrialExpired ||
        hasCurrentStoreTrialOptedOut

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
                    enableDynamicHeight
                    fullWidth
                    singleStoreInline
                    buttonClassName={css.storeSelectorButton}
                    hideSelectedFromDropdown
                    applyClassicThemeOverride
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
                        {!isAiAgentExpandingTrialExperienceForAllEnabled ||
                        hasTrial
                            ? 'Get Started'
                            : 'Try for free'}
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
