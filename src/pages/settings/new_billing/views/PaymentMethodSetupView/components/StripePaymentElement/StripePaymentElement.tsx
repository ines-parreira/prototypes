import {PaymentElement} from '@stripe/react-stripe-js'
import React from 'react'

export const StripePaymentElement: React.FC = () => {
    return <PaymentElement options={{fields: {billingDetails: 'never'}}} />
}
