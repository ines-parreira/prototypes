import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { useCurrentPriceIds } from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import { useUpdateSubscription } from 'pages/settings/new_billing/hooks/useUpdateSubscription'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import {
    getCurrentAccountState,
    isTrialing as getIsTrialing,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

import { FocusActivationModal, SalesEarlyAccessUtils } from '../utils'

const useAutoDisplaySalesEarlyAccessModal = (
    shouldDisplayModal: boolean,
    showModal: () => void,
) => {
    const hasActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation)
    const currentAccount = useAppSelector(getCurrentAccountState)
    useEffect(() => {
        if (hasActivationEnabled && shouldDisplayModal) {
            const utils = SalesEarlyAccessUtils(currentAccount.get('id'))

            if (!utils.hasModalBeenDisplayed()) {
                showModal()
                utils.persistModalDisplayedAt()
            }
        }
    }, [currentAccount, hasActivationEnabled, shouldDisplayModal, showModal])
}

export const useEarlyAccessModalState = ({
    atLeastOneStoreHasActiveTrial,
    hasActivationEnabled,
    autoDisplayDisabled,
}: {
    atLeastOneStoreHasActiveTrial?: boolean
    hasActivationEnabled: boolean
    autoDisplayDisabled?: boolean
}) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { data: upgradePlanData, isLoading: upgradePlanLoading } =
        useAiAgentUpgradePlan(accountDomain, hasActivationEnabled)
    const billingState = useBillingState({ enabled: hasActivationEnabled })

    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false)
    const isOnNewPlan =
        billingState?.data?.current_plans?.automate?.generation === 6

    const currentUser = useAppSelector(getCurrentUser)
    const isTrialing = useAppSelector(getIsTrialing)
    const isCurrentUserAdmin = isAdmin(currentUser)
    const currentPlan = billingState?.data?.current_plans?.automate
    const helpdeskPlan = billingState?.data?.current_plans?.helpdesk

    useAutoDisplaySalesEarlyAccessModal(
        !autoDisplayDisabled &&
            isCurrentUserAdmin &&
            !isOnNewPlan &&
            !isTrialing &&
            !atLeastOneStoreHasActiveTrial,
        () => setIsPreviewModalVisible(true),
    )

    const isLoading = billingState.isLoading || upgradePlanLoading

    const currentProducts = useAppSelector(getCurrentPlansByProduct)
    const currentPriceIds = useCurrentPriceIds()

    const priceIdsWithoutAutomationOne = currentPriceIds.filter(
        (priceId) => priceId !== currentProducts?.automation?.price_id,
    )

    // The Early Access plan is not able to return the price_id, we uses the plan_id instead
    const priceIdsAndPlanIdsWithEarlyAccessPlanAdded = [
        ...priceIdsWithoutAutomationOne!,
        upgradePlanData?.plan_id,
    ].filter(Boolean) as string[]

    const { isLoading: isSubscriptionUpdating, handleSubscriptionUpdate } =
        useUpdateSubscription({
            onSuccess: () => {
                const url = new URL(window.location.href)
                url.searchParams.set(FocusActivationModal.searchParam, 'true')
                window.history.pushState(null, '', url.toString())
            },
        })

    return useMemo(
        () => ({
            earlyAccessPlan: upgradePlanData,
            currentPlan,
            helpdeskPlan,
            isPreviewModalVisible,
            setIsPreviewModalVisible,
            isOnNewPlan,
            isLoading,
            isCurrentUserAdmin,
            isSubscriptionUpdating,
            handleSubscriptionUpdate: () =>
                handleSubscriptionUpdate(
                    priceIdsAndPlanIdsWithEarlyAccessPlanAdded,
                ),
        }),
        [
            upgradePlanData,
            currentPlan,
            helpdeskPlan,
            isPreviewModalVisible,
            isOnNewPlan,
            isLoading,
            isCurrentUserAdmin,
            isSubscriptionUpdating,
            handleSubscriptionUpdate,
            priceIdsAndPlanIdsWithEarlyAccessPlanAdded,
        ],
    )
}
