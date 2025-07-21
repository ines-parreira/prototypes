import React, { useEffect } from 'react'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useTheme } from 'core/theme'
import Button from 'pages/common/components/button/Button'
import { reportCRMGrowthError } from 'pages/settings/new_billing/utils/reportCRMGrowthError'

type StripeElementsProviderProps = {
    clientSecret?: string
    children: React.ReactNode
}

export const StripeElementsProvider: React.FC<StripeElementsProviderProps> = ({
    children,
    clientSecret,
}) => {
    const { tokens } = useTheme()
    const [stripe, setStripe] = React.useState<Stripe | null>()
    const [error, setError] = React.useState<Error | null>(null)

    const load = () => getStripe().then(setStripe).catch(setError)

    useEffect(() => {
        void load()
    }, [])

    const reload = () => {
        setStripe(undefined)
        setError(null)
        void load()
    }

    return (
        <Elements
            stripe={stripe ?? null}
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
            {error ? (
                <>
                    <p>Failed to load form</p>
                    <Button onClick={reload} size="small">
                        Retry
                    </Button>
                </>
            ) : stripe === undefined ? (
                <LoadingSpinner />
            ) : (
                children
            )}
        </Elements>
    )
}

/**
 * Attempts to load Stripe.
 * Retries up to 3 times to mitigate intermittent loading failures.
 * (commonly seen as "Failed to load Stripe.js" error).
 **/
const getStripe = (() => {
    let totalAttempts = 0

    return async () => {
        if (!window.STRIPE_PUBLIC_KEY) {
            throw new Error('Stripe public key is not set')
        }

        let error: unknown = null

        for (let attempt = 0; attempt < 3; attempt++) {
            totalAttempts++

            try {
                const stripe = await loadStripe(window.STRIPE_PUBLIC_KEY)
                return stripe
            } catch (err) {
                error = err
            }
        }

        reportCRMGrowthError(
            error,
            `Failed to load stripe (trial: ${totalAttempts}`,
        )

        throw new Error('Failed to load Stripe.js')
    }
})()
