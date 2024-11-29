import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {useUpdateBillingContactWithSideEffects} from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'
import {useSubmitPaymentMethod} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethod'
import {BillingContactUpdatePayload} from 'state/billing/types'
import {reportError} from 'utils/errors'

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
            handleError(error, 'Failed to update billing contact')
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

const handleError = (error: unknown, context: string) => {
    reportError(error, {
        tags: {team: CRM_GROWTH_SENTRY_TEAM},
        extra: {
            context,
        },
    })
}
