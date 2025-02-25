import React, { useEffect } from 'react'

import { useElements } from '@stripe/react-stripe-js'
import { useController, useFormContext } from 'react-hook-form'

import { StripePaymentElement } from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/StripePaymentElement'

export function StripePaymentFields() {
    const elements = useElements()

    const { control } = useFormContext<{
        paymentMethod: {
            complete: boolean
        }
    }>()

    const { field } = useController({
        name: 'paymentMethod',
        control,
        rules: {
            validate: (value) => value.complete,
        },
    })

    useEffect(() => {
        field.ref(elements?.getElement('payment'))
    }, [elements, field])

    return (
        <StripePaymentElement
            onChange={(event) =>
                field.onChange({
                    target: { value: { complete: event.complete } },
                })
            }
            onBlur={field.onBlur}
        />
    )
}
