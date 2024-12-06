import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import React from 'react'

import {useTheme} from 'theme'

const stripePromise = loadStripe(window.STRIPE_PUBLIC_KEY!, {locale: 'en'})

type IStripeElementsProviderProps = {
    clientSecret?: string
}

export const StripeElementsProvider: React.FC<IStripeElementsProviderProps> = ({
    children,
    clientSecret,
}) => {
    const {tokens} = useTheme()

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorText: tokens.Neutral.Grey_6.value,
                        colorPrimary: tokens.Main.Primary.value,
                        colorBackground: tokens.Neutral.Grey_0.value,
                        colorDanger: tokens.Feedback.Error.value,
                        colorWarning: 'purple',
                        colorSuccess: 'orange',
                        colorTextSecondary: tokens.Neutral.Grey_4.value,
                        colorTextPlaceholder: tokens.Neutral.Grey_4.value,
                        spacingUnit: '2.33px',
                        gridRowSpacing: '16px',
                        fontSizeBase: '14px',
                        borderRadius: '4px',
                        fontFamily:
                            "'Inter', 'Helvetica Neue', Arial, Helvetica, sans-serif",
                    },
                    rules: {
                        '.Block': {
                            boxShadow: 'none',
                        },
                        '.Label': {
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontSize: '14px',
                            lineHeight: '20px',
                            letterSpacing: '-0.1px',
                        },
                        '.Input': {
                            boxShadow: 'none',
                            borderColor: tokens.Neutral.Grey_3.value,
                        },
                    },
                },
            }}
        >
            {children}
        </Elements>
    )
}
