import {useUpdateBillingContactWithSideEffects} from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'
import {reportCRMGrowthError} from 'pages/settings/new_billing/utils/reportCRMGrowthError'
import {useSubmitPaymentMethod} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethod'
import {BillingContactUpdatePayload} from 'state/billing/types'

export const useSubmitPaymentMethodWithBillingContact = (
    overrides?: Parameters<typeof useSubmitPaymentMethod>['0']
) => {
    const {submitPaymentMethod, isLoading: isSubmitPaymentMethodLoading} =
        useSubmitPaymentMethod(overrides)

    const updateBillingContact = useUpdateBillingContactWithSideEffects({
        onSuccess: () => {
            return submitPaymentMethod()
        },
        onError: (error) => {
            reportCRMGrowthError(error, 'Failed to update billing contact')
            throw error
        },
    })

    const submitPaymentMethodWithBillingContact = (
        billingContact: BillingContactUpdatePayload
    ) => updateBillingContact.mutateAsync([billingContact])

    return {
        submitPaymentMethodWithBillingContact,
        submitPaymentMethod,
        isLoading:
            updateBillingContact.isLoading || isSubmitPaymentMethodLoading,
    }
}
