import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { ActivationManageButton } from 'pages/aiAgent/Activation/components/ActivationManageButton/ActivationManageButton'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { EarlyAccessModal } from 'pages/aiAgent/Activation/components/EarlyAccessModal/EarlyAccessModal'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { useEarlyAccessModalState } from './useEarlyAccessModalState'
import { useStoreActivations } from './useStoreActivations'

export const useActivation = (
    pageName: string,
    options: {
        autoDisplayEarlyAccessDisabled?: boolean
    } = {},
) => {
    const searchParams = new URLSearchParams(window.location.search)
    const [isModalVisible, setIsModalVisible] = useState(
        searchParams.has('focusActivationModal'),
    )
    const hasActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getShopifyIntegrationsSortedByName)
    const { shopName } = useParams<{
        shopName?: string
    }>()

    const filteredStoresName = useMemo(() => {
        const storeNames = stores.map((store) => store.name)
        if (shopName) {
            return storeNames.filter((store) => store === shopName)
        }

        return storeNames
    }, [stores, shopName])

    const { storeConfigurations } = useStoreConfigurationForAccount({
        accountDomain,
        storesName: filteredStoresName,
    })

    const filteredStoreConfigurations: StoreConfiguration[] = useMemo(() => {
        if (shopName) {
            return (
                storeConfigurations?.filter(
                    (storeConfiguration) =>
                        storeConfiguration.storeName === shopName,
                ) ?? []
            )
        }

        return storeConfigurations ?? []
    }, [storeConfigurations, shopName])

    const { progressPercentage } = useStoreActivations({
        accountDomain,
        storeConfigurations: filteredStoreConfigurations,
        pageName,
    })

    const {
        isOnNewPlan,
        setIsPreviewModalVisible,
        isPreviewModalVisible,
        isCurrentUserAdmin,
        earlyAccessPlan,
        isLoading,
        handleSubscriptionUpdate,
        isSubscriptionUpdating,
        currentPlan,
    } = useEarlyAccessModalState({
        hasActivationEnabled,
        autoDisplayDisabled: options.autoDisplayEarlyAccessDisabled,
    })

    useEffect(() => {
        if (isPreviewModalVisible) {
            logEvent(SegmentEvent.AiAgentActivateEarlyAccessModalViewed, {
                page: pageName,
            })
        }
    }, [isPreviewModalVisible, pageName])

    const ConnectedActivationModal = useCallback(
        () => (
            <AiAgentActivationModal
                isOpen={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false)
                    logEvent(SegmentEvent.AiAgentActivateCloseActivationModal, {
                        page: pageName,
                        reason: 'clicked-on-cancel-or-clicked-outside',
                    })
                }}
                accountDomain={accountDomain}
                storeConfigs={filteredStoreConfigurations}
                onSalesEnabled={() => {
                    if (isOnNewPlan) {
                        return true
                    }

                    setIsPreviewModalVisible(true)
                    return false
                }}
                pageName={pageName}
            />
        ),
        [
            isModalVisible,
            setIsModalVisible,
            accountDomain,
            filteredStoreConfigurations,
            isOnNewPlan,
            setIsPreviewModalVisible,
            pageName,
        ],
    )

    const ConnectedActivationButton = useCallback(
        () =>
            hasActivationEnabled ? (
                <ActivationManageButton
                    onClick={() => {
                        setIsModalVisible((prev) => !prev)
                        logEvent(
                            SegmentEvent.AiAgentActivateMainButtonClicked,
                            {
                                page: pageName,
                            },
                        )
                    }}
                    progress={progressPercentage}
                    variant={pageName === 'overview' ? 'bordered' : 'flat'}
                />
            ) : null,
        [hasActivationEnabled, progressPercentage, pageName],
    )

    const ConnectedEarlyAccessModal = useCallback(
        () => (
            <EarlyAccessModal
                isLoading={isLoading}
                isUpgrading={isSubscriptionUpdating}
                isOpen={isPreviewModalVisible}
                onClose={() => {
                    setIsPreviewModalVisible(false)
                    logEvent(
                        SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
                        {
                            page: pageName,
                            reason: 'clicked-on-cross-or-outside',
                        },
                    )
                }}
                onStayClick={() => {
                    setIsPreviewModalVisible(false)
                    logEvent(
                        SegmentEvent.AiAgentActivatePreviewPricingModalClosed,
                        {
                            page: pageName,
                            reason: 'clicked-on-stay-button',
                        },
                    )
                }}
                onUpgradeClick={() => {
                    handleSubscriptionUpdate()
                        .catch(() => {})
                        .finally(() => {
                            setIsPreviewModalVisible(false)
                        })
                }}
                earlyAccessPlan={earlyAccessPlan}
                currentPlan={currentPlan}
                userIsAdmin={isCurrentUserAdmin}
            />
        ),
        [
            isLoading,
            isSubscriptionUpdating,
            isPreviewModalVisible,
            setIsPreviewModalVisible,
            handleSubscriptionUpdate,
            earlyAccessPlan,
            currentPlan,
            isCurrentUserAdmin,
            pageName,
        ],
    )

    return {
        ActivationModal: ConnectedActivationModal,
        ActivationButton: ConnectedActivationButton,
        EarlyAccessModal: ConnectedEarlyAccessModal,
    }
}
