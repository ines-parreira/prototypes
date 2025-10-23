import type { updateBillingContact } from 'models/billing/resources'
import { useUpdateBillingContactWithSideEffects } from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'
import { isStripeUserError } from 'pages/settings/new_billing/utils/isStripeUserError'
import { reportCRMGrowthError } from 'pages/settings/new_billing/utils/reportCRMGrowthError'
import type { MutationOverrides } from 'types/query'

export const useSubmitBillingAddress = (
    overrides?: MutationOverrides<typeof updateBillingContact>,
) => {
    return useUpdateBillingContactWithSideEffects({
        ...overrides,
        onError: (error, ...args) => {
            overrides?.onError?.(error, ...args)

            if (!isStripeUserError(error)) {
                reportCRMGrowthError(error, 'Failed to submit billing contact')
            }
        },
    })
}
