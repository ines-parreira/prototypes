import React from 'react'

import { Navigation } from 'components/Navigation/Navigation'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
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
                    <Navigation.SectionItem isSelected displayType="indent">
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
