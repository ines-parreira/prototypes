import type { updateBillingContact } from 'models/billing/resources'
import { useUpdateBillingContactWithSideEffects } from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'
import { reportCRMGrowthError } from 'pages/settings/new_billing/utils/reportCRMGrowthError'
import type { MutationOverrides } from 'types/query'

export const useSubmitBillingAddress = (
    overrides?: MutationOverrides<typeof updateBillingContact>,
) => {
    return useUpdateBillingContactWithSideEffects({
        ...overrides,
        onError: (error, ...args) => {
            overrides?.onError?.(error, ...args)

            reportCRMGrowthError(error, `Failed to submit billing contact`)
        },
    })
}
