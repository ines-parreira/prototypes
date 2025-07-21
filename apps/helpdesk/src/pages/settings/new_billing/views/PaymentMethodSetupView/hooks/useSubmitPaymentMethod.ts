import { useConfirmBillingPaymentMethodSetupWithSideEffects } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useConfirmBillingPaymentMethodSetupWithSideEffects'
import { useConfirmStripeSetupIntent } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useConfirmStripeSetupIntent'

export const useSubmitPaymentMethod = (
    overrides?: Parameters<
        typeof useConfirmBillingPaymentMethodSetupWithSideEffects
    >['0'],
) => {
    const confirmBillingPaymentMethodSetup =
        useConfirmBillingPaymentMethodSetupWithSideEffects(overrides)

    const confirmStripeSetupIntent = useConfirmStripeSetupIntent({
        onSuccess: (response) => {
            if (response.setupIntent?.id) {
                return confirmBillingPaymentMethodSetup.mutateAsync({
                    data: {
                        id: response.setupIntent.id,
                    },
                })
            }
        },
    })

    const submitPaymentMethod = () => confirmStripeSetupIntent.mutateAsync([])

    return {
        submitPaymentMethod,
        isLoading:
            confirmStripeSetupIntent.isLoading ||
            confirmBillingPaymentMethodSetup.isLoading,
    }
}
