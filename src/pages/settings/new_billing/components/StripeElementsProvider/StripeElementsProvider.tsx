import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import React, {useContext} from 'react'

import {ThemeContext} from 'theme'

const stripePromise = loadStripe(window.STRIPE_PUBLIC_KEY!, {locale: 'en'})

type IStripeElementsProviderProps = {
    clientSecret?: string
}

export const StripeElementsProvider: React.FC<IStripeElementsProviderProps> = ({
    children,
    clientSecret,
}) => {
    const {colorTokens} = useContext(ThemeContext) ?? {}

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorText: colorTokens?.Neutral.Grey_6.value,
                        colorPrimary: colorTokens?.Main.Primary.value,
                        colorBackground: colorTokens?.Neutral.Grey_0.value,
                        colorDanger: colorTokens?.Feedback.Error.value,
                        colorWarning: 'purple',
                        colorSuccess: 'orange',
                        colorTextSecondary: colorTokens?.Neutral.Grey_4.value,
                        colorTextPlaceholder: colorTokens?.Neutral.Grey_4.value,
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
                            borderColor: colorTokens?.Neutral.Grey_3
                                .value as string,
                        },
                    },
                },
            }}
        >
            {children}
        </Elements>
    )
}
