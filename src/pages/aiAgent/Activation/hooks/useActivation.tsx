import React, { useMemo, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { ActivationManageButton } from 'pages/aiAgent/Activation/components/ActivationManageButton/ActivationManageButton'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { EarlyAccessModal } from 'pages/aiAgent/Activation/components/EarlyAccessModal/EarlyAccessModal'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { PageName } from '../types'
import { useBillingData } from './useBillingData'
import { computeActivationScore } from './useStoreActivations'

export const useActivation = (pageName?: PageName) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const hasActivationEnabled = useFlags()[FeatureFlagKey.AiAgentActivation]
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getShopifyIntegrationsSortedByName)
    const { shopName } = useParams<{
        shopName: string
    }>()
    const storesName = useMemo(
        () =>
            stores
                .map((store) => store.name)
                .filter((store) => {
                    if (shopName) {
                        return store === shopName
                    }

                    return true
                }),
        [stores, shopName],
    )

    const { storeConfigurations } = useStoreConfigurationForAccount({
        accountDomain,
        storesName,
    })

    const { totalScore, currentScore } = computeActivationScore(
        storeConfigurations ?? [],
    )

    const progressPercentage = totalScore
        ? Math.round((currentScore / totalScore) * 100)
        : 0

    const {
        isOnNewPlan,
        setIsPreviewModalVisible,
        isPreviewModalVisible,
        isCurrentUserAdmin,
        currentPlan,
        earlyAccessPlan,
        isLoading,
    } = useBillingData()

    return useMemo(
        () => ({
            ActivationButton: () =>
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
                    />
                ) : null,
            ActivationModal: () => (
                <AiAgentActivationModal
                    isOpen={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    accountDomain={accountDomain}
                    storeConfigs={storeConfigurations ?? []}
                    onSalesEnabled={() => {
                        if (isOnNewPlan) {
                            return true
                        }

                        setIsPreviewModalVisible(true)
                        return false
                    }}
                />
            ),
            EarlyAccessModal: () => (
                <EarlyAccessModal
                    isLoading={isLoading}
                    isOpen={isPreviewModalVisible}
                    onClose={() => setIsPreviewModalVisible(false)}
                    onStayClick={() => setIsPreviewModalVisible(false)}
                    onUpgradeClick={() => {}}
                    currentPlan={currentPlan}
                    earlyAccessPlan={earlyAccessPlan}
                    disableUpgradeButton={!isCurrentUserAdmin}
                />
            ),
        }),
        [
            hasActivationEnabled,
            isModalVisible,
            storeConfigurations,
            accountDomain,
            pageName,
            currentPlan,
            earlyAccessPlan,
            isPreviewModalVisible,
            isOnNewPlan,
            isCurrentUserAdmin,
            isLoading,
            setIsPreviewModalVisible,
            progressPercentage,
        ],
    )
}
