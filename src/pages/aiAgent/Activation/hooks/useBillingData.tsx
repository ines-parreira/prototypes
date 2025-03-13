import React, { useMemo, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

export const useBillingData = () => {
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const billingState = useBillingState()

    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false)
    const isOnNewPlan =
        billingState?.data?.current_plans?.automate?.generation === 6

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserAdmin = isAdmin(currentUser)

    return useMemo(
        () => ({
            earlyAccessPlan: earlyAccessAutomatePlanQuery.data,
            currentPlan: billingState?.data?.current_plans?.automate,
            isPreviewModalVisible,
            setIsPreviewModalVisible,
            isOnNewPlan,
            isLoading:
                billingState.isLoading ||
                earlyAccessAutomatePlanQuery.isLoading,
            isCurrentUserAdmin,
        }),
        [
            earlyAccessAutomatePlanQuery.data,
            isPreviewModalVisible,
            isOnNewPlan,
            billingState,
            isCurrentUserAdmin,
            earlyAccessAutomatePlanQuery.isLoading,
        ],
    )
}
