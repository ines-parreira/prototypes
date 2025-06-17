import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import _isEqual from 'lodash/isEqual'
import { useLocation, useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import {
    ACTION_TYPE,
    State,
    stateToUpdatedStoreConfiguration,
    StoreActivation,
    updatePricing,
    useStoreActivationReducer,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useActivateStore } from 'pages/aiAgent/Activation/hooks/useActivateStore'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { useStoresKnowledgeStatus } from 'pages/aiAgent/hooks/useStoresKnowledgeStatus'
import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { useSelfServiceChatChannelsMultiStore } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { compare } from 'utils'

import { FocusActivationModal } from '../utils'

export type ComputeActivationPercentage = {
    support: {
        chat: Pick<StoreActivation['support']['chat'], 'enabled'>
        email: Pick<StoreActivation['support']['email'], 'enabled'>
    }
    sales: Pick<StoreActivation['sales'], 'enabled'>
}
export const computeActivationPercentage = (
    state: Record<string, ComputeActivationPercentage>,
): number => {
    const totalStores = Object.values(state).length
    const totalScore = totalStores * 3

    const currentScore = Object.values(state).reduce(
        (score, storeActivation) => {
            let storeScore = 0
            if (storeActivation.support.chat.enabled) {
                storeScore += 1
            }
            if (storeActivation.support.email.enabled) {
                storeScore += 1
            }

            if (storeActivation.sales.enabled) {
                storeScore += 1
            }

            return score + storeScore
        },
        0,
    )

    return Math.round(safeDivide(currentScore, totalScore) * 100)
}

export const useStoreConfigurations = (
    accountDomain: string,
    storeName?: string,
) => {
    const { storeConfigurations: allStoreConfigurations, isLoading } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName: storeName ? [storeName] : undefined,
        })

    const storeConfigurations: StoreConfiguration[] = useMemo(() => {
        return (
            allStoreConfigurations?.sort((a, b) =>
                compare(a.storeName, b.storeName),
            ) ?? []
        )
    }, [allStoreConfigurations])

    const storeNames = useMemo(() => {
        return storeConfigurations.map((it) => it.storeName)
    }, [storeConfigurations])

    return { storeConfigurations, storeNames, isLoading }
}

/**
 * Main hook for coordinating AI Agent feature activation across stores.
 *
 * **Data Flow & Dependencies:**
 * 1. `useStoreConfigurations` → extracts `storeNames` and `chatIds`
 * 2. Parallel data fetching using extracted identifiers:
 *    - Chat integration status via `useFetchChatIntegrationsStatusData` (using `chatIds`)
 *    - Self-service chat channels via `useSelfServiceChatChannelsMultiStore` (using `storeNames`)
 *    - Stores knowledge status via `useStoresKnowledgeStatus` (independent)
 *    - Help center list via `useGetHelpCenterList` (independent)
 *    - Email integrations via `useEmailIntegrations` (independent)
 * 3. All data coordinated through `useStoreActivationReducer`
 * 4. Activation logic handled by `useActivateStore`
 *
 * **Features provided:**
 * - State management with reducer for activations
 * - Change functions for Sales/Support (Chat/Email) with automatic event logging
 * - Configuration saving with `stateToUpdatedStoreConfiguration` transformation
 * - Migration to new pricing with feature flag support
 * - Progress percentage calculation based on enabled features across stores
 * - Activation logic via `useActivateStore` with loading states
 * - Store filtering for single-store contexts (overview vs specific store pages)
 *
 * @param storeName - If provided, filters results for this store only
 * @param withChatIntegrationsStatus - Enables chat integrations status retrieval (default: false)
 * @param withStoresKnowledgeStatus - Enables stores knowledge status retrieval (default: false)
 *
 * @returns Object containing:
 *   - storeActivations: Record of store activations by store name
 *   - progressPercentage: Overall activation progress percentage
 *   - isFetchLoading: Loading state for data fetching
 *   - isSaveLoading: Loading state for save operations
 *   - changeSales: Function to toggle sales activation for a store
 *   - changeSupport: Function to toggle support activation for a store
 *   - changeSupportChat: Function to toggle support chat activation for a store
 *   - changeSupportEmail: Function to toggle support email activation for a store
 *   - saveStoreConfigurations: Function to save current configurations
 *   - migrateToNewPricing: Function to migrate to new pricing model
 *   - endTrial: Function to end trial period
 *   - activation: Object with store activation methods (canActivate, activate, isActivating)
 */
export const useStoreActivations = ({
    storeName,
    withChatIntegrationsStatus = false,
    withStoresKnowledgeStatus = false,
}: {
    storeName?: string
    withChatIntegrationsStatus?: boolean
    withStoresKnowledgeStatus?: boolean
} = {}): {
    storeActivations: Record<string, StoreActivation>
    progressPercentage: number
    isFetchLoading: boolean
    isSaveLoading: boolean
    changeSales: (storeName: string, newValue: boolean) => void
    changeSupport: (storeName: string, newValue: boolean) => void
    changeSupportChat: (storeName: string, newValue: boolean) => void
    changeSupportEmail: (storeName: string, newValue: boolean) => void
    saveStoreConfigurations: () => Promise<void>
    migrateToNewPricing: () => Promise<void>
    endTrial: () => Promise<void>
    activation: (args: { shopName: string | null }) => {
        canActivate: () => {
            isLoading: boolean
            isDisabled: boolean
        }
        activate: (onSuccess?: () => void) => Promise<void>
        isActivating: boolean
    }
} => {
    const flags = useFlags()
    const flagsRef = useRef(flags)
    flagsRef.current = flags

    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6
    const pageName = window.location.pathname

    const isAiSalesBetaUser = !!flags[FeatureFlagKey.AiSalesAgentBeta]
    const hasAiAgentNewActivationXp =
        !!flags[FeatureFlagKey.AiAgentNewActivationXp]
    const aiSalesAgentEmailEnabled =
        !!flags[FeatureFlagKey.AiSalesAgentActivationEmailSettings]

    const location = useLocation()
    const params = useParams<{ shopName?: string }>()
    const singleStoreName =
        FocusActivationModal.extractStoreName(location) ?? params.shopName

    const { state, dispatch } = useStoreActivationReducer()

    // Expose only the store, which we are on but internally keep track of all stores.
    // Allows applying operations on all stores regarding if we are on the overview page or not.
    const filteredState = useMemo(() => {
        if (singleStoreName) {
            return Object.entries(state).reduce<State>(
                (acc, [storeName, store]) => {
                    if (storeName === singleStoreName) {
                        acc[storeName] = store
                    }

                    return acc
                },
                {},
            )
        }

        return state
    }, [state, singleStoreName])

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const {
        storeConfigurations,
        storeNames,
        isLoading: isStoreConfigurationLoading,
    } = useStoreConfigurations(accountDomain, storeName)

    const chatIds = useMemo(() => {
        return storeConfigurations.flatMap(
            (storeConfiguration) =>
                storeConfiguration.monitoredChatIntegrations,
        )
    }, [storeConfigurations])
    const {
        data: chatIntegrationStatus,
        isLoading: isChatIntegrationsStatusLoading,
    } = useFetchChatIntegrationsStatusData({
        enabled: !!chatIds.length && withChatIntegrationsStatus,
        chatIds,
        refetchOnWindowFocus: false,
    })

    const selfServiceChatChannels = useSelfServiceChatChannelsMultiStore(
        SHOPIFY_INTEGRATION_TYPE,
        storeNames,
        false,
    )

    const {
        data: storesKnowledgeStatus,
        isLoading: isStoresKnowledgeStatusLoading,
    } = useStoresKnowledgeStatus({
        enabled: withStoresKnowledgeStatus,
    })

    const { data: helpCenterListData, isLoading: isHelpCenterListLoading } =
        useGetHelpCenterList(
            { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            },
        )

    const { emailIntegrations } = useEmailIntegrations()

    const [storeConfigUpdateAction, setStoreConfigUpdateAction] = useState<
        ACTION_TYPE | undefined
    >(undefined)

    useEffect(() => {
        const updateAction: ACTION_TYPE = {
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations,
            selfServiceChatChannels,
            emailIntegrations,
            helpCentersFaq: helpCenterListData?.data.data,
            ldFlags: flagsRef.current,
            chatIntegrationStatus,
            storesKnowledgeStatus,
            hasNewAutomatePlan,
            flags: {
                hasAiAgentNewActivationXp,
                isAiSalesBetaUser,
                aiSalesAgentEmailEnabled,
            },
        }

        if (_isEqual(storeConfigUpdateAction, updateAction)) {
            return
        }

        setStoreConfigUpdateAction(updateAction)
        dispatch(updateAction)
    }, [
        selfServiceChatChannels,
        emailIntegrations,
        storeConfigurations,
        dispatch,
        helpCenterListData,
        chatIntegrationStatus,
        hasAiAgentNewActivationXp,
        hasNewAutomatePlan,
        isAiSalesBetaUser,
        aiSalesAgentEmailEnabled,
        storesKnowledgeStatus,
        storeConfigUpdateAction,
    ])

    const { isLoading: isSaveLoading, upsertStoresConfiguration } =
        useStoresConfigurationMutation({ accountDomain })

    const saveStoreConfigurations = useCallback(async () => {
        logEvent(SegmentEvent.AiAgentActivateCloseActivationModal, {
            page: pageName,
            reason: 'clicked-on-save-button',
        })

        const updatedConfigurations =
            stateToUpdatedStoreConfiguration(filteredState)
        await upsertStoresConfiguration(updatedConfigurations)
    }, [filteredState, upsertStoresConfiguration, pageName])

    const migrateToNewPricing = useCallback(async () => {
        // Using state instead of filteredState because we want to update all stores, not only the one we are on.
        // Do not rely on dispatch here because the update is not immediate but for the next render.
        const updatedState = updatePricing(state, {
            type: 'UPDATE_PRICING',
            flags: {
                hasAiAgentNewActivationXp,
                isAiSalesBetaUser,
                aiSalesAgentEmailEnabled,
            },
        })
        const storeConfigurationsToUpdate = stateToUpdatedStoreConfiguration(
            updatedState,
            { salesDeactivatedDatetime: null },
        )
        await upsertStoresConfiguration(storeConfigurationsToUpdate)

        // Update the local state
        dispatch({
            type: 'UPDATE_PRICING',
            flags: {
                hasAiAgentNewActivationXp,
                isAiSalesBetaUser,
                aiSalesAgentEmailEnabled,
            },
        })
    }, [
        state,
        upsertStoresConfiguration,
        dispatch,
        hasAiAgentNewActivationXp,
        isAiSalesBetaUser,
        aiSalesAgentEmailEnabled,
    ])

    const endTrial = useCallback(async () => {
        const storeConfigurationsToUpdate = stateToUpdatedStoreConfiguration(
            state,
            { salesDeactivatedDatetime: null },
        )
        await upsertStoresConfiguration(storeConfigurationsToUpdate)
    }, [state, upsertStoresConfiguration])

    const isFetchLoading =
        isStoreConfigurationLoading ||
        isHelpCenterListLoading ||
        isChatIntegrationsStatusLoading ||
        isStoresKnowledgeStatusLoading

    const activateStore = useActivateStore({
        isLoading: isFetchLoading,
        state: state,
    })

    return {
        activation: activateStore,
        storeActivations: filteredState,
        progressPercentage: computeActivationPercentage(filteredState),
        isFetchLoading,
        isSaveLoading,
        changeSales: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SALES',
                storeName,
                newValue,
                flags: {
                    hasAiAgentNewActivationXp,
                    isAiSalesBetaUser,
                    aiSalesAgentEmailEnabled,
                },
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Sales,
                    page: pageName,
                },
            )
        },
        changeSupport: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT',
                storeName,
                newValue,
                flags: {
                    hasAiAgentNewActivationXp,
                    isAiSalesBetaUser,
                    aiSalesAgentEmailEnabled,
                },
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                },
            )
        },
        changeSupportChat: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT_CHAT',
                storeName,
                newValue,
                hasNewAutomatePlan,
                flags: {
                    hasAiAgentNewActivationXp,
                    isAiSalesBetaUser,
                    aiSalesAgentEmailEnabled,
                },
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                    channel: 'chat',
                },
            )
        },
        changeSupportEmail: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName,
                newValue,
                hasNewAutomatePlan,
                flags: {
                    hasAiAgentNewActivationXp,
                    isAiSalesBetaUser,
                    aiSalesAgentEmailEnabled,
                },
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                    channel: 'email',
                },
            )
        },
        saveStoreConfigurations,
        migrateToNewPricing,
        endTrial,
    }
}
