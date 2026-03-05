import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import { useSidebar } from '@repo/navigation'
import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
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
import { CollapsedActionDrivenNavigationItems } from './CollapsedActionDrivenNavigationItems'
import { useActionDrivenNavbarSections } from './useActionDrivenNavbarSections'
import { getCollapsedSectionName } from './utils'

import css from './AiAgentNavbar.less'

export const ActionDrivenNavigation = () => {
    const { isCollapsed: isSidebarCollapsed } = useSidebar()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

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
        currentAutomatePlan,
        hasCurrentStoreTrialOptedOut,
        hasCurrentStoreTrialExpired,
        hasCurrentStoreTrialStarted,
    } = useTrialAccess(selectedStore)

    const { hasAccess } = useAiAgentAccess(selectedStore)

    const onboardingState = useAiAgentOnboardingState(selectedStore || '')
    const isOnboarded = onboardingState === OnboardingState.Onboarded
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )
    const isActive =
        !!selectedStore &&
        !!getStoreActivationStatus &&
        getStoreActivationStatus(selectedStore)

    const hasTrial =
        hasCurrentStoreTrialStarted ||
        hasCurrentStoreTrialExpired ||
        hasCurrentStoreTrialOptedOut

    const shouldRenderCollapsedItem =
        !!selectedStore &&
        (!hasAccess ||
            (onboardingState === OnboardingState.OnboardingWizard && !isActive))

    const collapsedSectionName = getCollapsedSectionName(
        hasTrial,
        currentAutomatePlan,
    )

    const shouldRenderAIAgentItems =
        !!selectedStore && hasAccess && (isActive || isOnboarded)

    if (
        hasWayfindingMS1Flag &&
        selectedStore &&
        navigationItems &&
        isSidebarCollapsed
    ) {
        return (
            <CollapsedActionDrivenNavigationItems
                navigationItems={navigationItems}
            />
        )
    }

    return (
        <Navigation.Root
            className={css.navigation}
            value={expandedSections}
            onValueChange={handleExpandedSectionsChange}
        >
            {hasAccess && isActionsInternalPlatformEnabled && (
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
                    withSearch={storeIntegrations.length > 10}
                />
            </div>

            {shouldRenderCollapsedItem && (
                <Navigation.SectionItem
                    as={NavLink}
                    to={getAiAgentBasePath(selectedStore!)}
                    exact
                    displayType="indent"
                >
                    {collapsedSectionName}
                </Navigation.SectionItem>
            )}

            {shouldRenderAIAgentItems && (
                <ActionDrivenNavigationItems
                    navigationItems={navigationItems}
                    selectedStore={selectedStore}
                    getChannelStatus={getChannelStatus}
                />
            )}
        </Navigation.Root>
    )
}
