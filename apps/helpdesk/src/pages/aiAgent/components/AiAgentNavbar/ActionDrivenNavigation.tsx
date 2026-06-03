import {
    FeatureFlagKey,
    useFlag,
    useFlagWithLoading,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import {
    NavigationSection,
    NavigationSectionGroup,
    useSidebar,
} from '@repo/navigation'
import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import {
    AIAgentNavigationSection,
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

const STORAGE_KEY = 'ai-agent-navigation'

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
        isActivationDataReady,
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
    const { value: expandingTrialForAll } = useFlagWithLoading<
        boolean | 'loading_state'
    >(FeatureFlagKey.AiAgentExpandingTrialExperienceForAll, false)
    const isExpandingTrialForAllEnabled = expandingTrialForAll === true
    const { value: isV3OnboardingEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )
    // Wizard-first cohort (onboarded, pre-trial) only exists under V3; gate on it
    // to keep V2 unchanged. Expanding-trial flag (GA) stays AND-ed as kill-switch.
    const isWizardFirstNavEnabled =
        isExpandingTrialForAllEnabled && isV3OnboardingEnabled === true
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
        !(isWizardFirstNavEnabled && isOnboarded) &&
        (!hasAccess ||
            (onboardingState === OnboardingState.OnboardingWizard && !isActive))

    const collapsedSectionName = getCollapsedSectionName(
        hasTrial,
        currentAutomatePlan,
    )

    // Onboarded stores reach the Overview pre-trial (no-automate wizard-first
    // flow) with no `hasAccess`, so also render the nav on `isWizardFirstNavEnabled`.
    const shouldRenderAIAgentItems =
        !!selectedStore &&
        ((hasAccess && (isActive || isOnboarded)) ||
            (isWizardFirstNavEnabled && isOnboarded))

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

    if (hasWayfindingMS1Flag) {
        return (
            <NavigationSectionGroup
                storageKey={STORAGE_KEY}
                defaultExpandedKeys={Object.values(AIAgentNavigationSection)}
            >
                {hasAccess && isActionsInternalPlatformEnabled && (
                    <NavigationSection
                        to={aiAgentRoutes.actionsPlatform}
                        id={AIAgentNavigationSection.ActionsPlatform}
                        label="Actions platform"
                    />
                )}

                <StoreSelector
                    key={String(isActivationDataReady)}
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
                    applyClassicThemeOverride
                    withSearch={storeIntegrations.length > 10}
                />

                {shouldRenderCollapsedItem && (
                    <NavigationSection
                        to={getAiAgentBasePath(selectedStore!)}
                        id={AIAgentNavigationSection.CollapsedSection}
                        exact
                        label={collapsedSectionName}
                    />
                )}

                {shouldRenderAIAgentItems && (
                    <ActionDrivenNavigationItems
                        navigationItems={navigationItems}
                        selectedStore={selectedStore}
                        getChannelStatus={getChannelStatus}
                    />
                )}
            </NavigationSectionGroup>
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
                    key={String(isActivationDataReady)}
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
