import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

import { SalesEarlyAccessUtils } from '../utils'

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

export const useEarlyAccessModalState = () => {
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const billingState = useBillingState()

    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false)
    const isOnNewPlan =
        billingState?.data?.current_plans?.automate?.generation === 6

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserAdmin = isAdmin(currentUser)
    const currentPlan = billingState?.data?.current_plans?.automate

    useAutoDisplaySalesEarlyAccessModal(
        isCurrentUserAdmin && currentPlan?.generation !== 6,
        () => setIsPreviewModalVisible(true),
    )

    const isLoading =
        billingState.isLoading || earlyAccessAutomatePlanQuery.isLoading

    return useMemo(
        () => ({
            earlyAccessPlan: earlyAccessAutomatePlanQuery.data,
            currentPlan,
            isPreviewModalVisible,
            setIsPreviewModalVisible,
            isOnNewPlan,
            isLoading,
            isCurrentUserAdmin,
        }),
        [
            earlyAccessAutomatePlanQuery.data,
            isPreviewModalVisible,
            isOnNewPlan,
            currentPlan,
            isLoading,
            isCurrentUserAdmin,
        ],
    )
}
