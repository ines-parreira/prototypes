import type { PaymentElementProps } from '@stripe/react-stripe-js'
import { PaymentElement } from '@stripe/react-stripe-js'

export const StripePaymentElement: React.FC<PaymentElementProps> = ({
    options,
    ...props
}) => {
    return (
        <PaymentElement
            options={{ fields: { billingDetails: 'never' }, ...options }}
            {...props}
        />
    )
}
