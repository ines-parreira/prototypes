import { FeatureFlagKey } from '@repo/feature-flags'

import { CustomerSummary } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { HelpdeskPlan } from 'models/billing/types'

import checkIsEnterpriseGMV from '../utils/checkIsEnterpriseGMV'
import useAutomatedHelpdeskCancellationFlowAvailable from './useAutomatedHelpdeskCancellationFlowAvailable'

export type useIsCancellationAvailableProps = {
    helpdeskPlan: HelpdeskPlan | null
    editingAvailable: boolean
    isTrialing: boolean
    customer?: CustomerSummary | null
}

const useIsCancellationAvailable = ({
    helpdeskPlan,
    editingAvailable,
    isTrialing,
    customer,
}: useIsCancellationAvailableProps) => {
    const disableAutoRenewalCancellationForEnterpriseGMV = useFlag(
        FeatureFlagKey.DisableAutoRenewalCancellationForEnterpriseGMV,
        false,
    )
    const isEnterpriseGMV = checkIsEnterpriseGMV(customer)
    const isAutomatedHelpdeskCancellationFlowAvailable =
        useAutomatedHelpdeskCancellationFlowAvailable(helpdeskPlan)

    if (disableAutoRenewalCancellationForEnterpriseGMV && isEnterpriseGMV) {
        return false
    }

    return (
        isAutomatedHelpdeskCancellationFlowAvailable &&
        editingAvailable &&
        !isTrialing
    )
}

export default useIsCancellationAvailable
