import React, { useMemo, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

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

export const useActivation = (pageName?: PageName) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const hasActivationEnabled = useFlags()[FeatureFlagKey.AiAgentActivation]
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const stores = useAppSelector(getShopifyIntegrationsSortedByName)
    const storesName = useMemo(
        () => stores.map((store) => store.name),
        [stores],
    )

    const { storeConfigurations } = useStoreConfigurationForAccount({
        accountDomain,
        storesName,
    })

    const {
        isOnNewPlan,
        setIsPreviewModalVisible,
        isPreviewModalVisible,
        isCurrentUserAdmin,
        plan,
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
                        progress={0.5}
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
                    plan={plan}
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
            plan,
            isPreviewModalVisible,
            isOnNewPlan,
            isCurrentUserAdmin,
            isLoading,
            setIsPreviewModalVisible,
        ],
    )
}
