import React from 'react'

import { useElements } from '@stripe/react-stripe-js'
import { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { useController, useFormContext } from 'react-hook-form'

import { StripeAddressElement } from 'pages/settings/new_billing/components/StripeAddressElement/StripeAddressElement'
import { validatePostalCode } from 'pages/settings/new_billing/utils/validations'

export function StripeAddressFields() {
    const elements = useElements()

    const { control } = useFormContext<{
        address?: {
            complete: boolean
        } & StripeAddressElementChangeEvent['value']
    }>()

    const { field } = useController({
        name: 'address',
        control,
        rules: {
            validate: () =>
                elements
                    ?.getElement('address')
                    ?.getValue()
                    .then((event) => {
                        if (!event.complete) {
                            return false
                        }

                        const postalCodeError = validatePostalCode(
                            event.value.address.postal_code,
                            event.value.address.country,
                        )

                        if (postalCodeError) {
                            return postalCodeError
                        }

                        return true
                    }),
        },
    })

    return (
        <StripeAddressElement
            options={{
                mode: 'billing',
                fields: { phone: 'always' },
                display: { name: 'organization' },
                validation: { phone: { required: 'never' } },
                defaultValues: field.value,
            }}
            onChange={(event) => {
                field.onChange({
                    target: {
                        value: { complete: event.complete, ...event.value },
                    },
                })
            }}
            onBlur={field.onBlur}
        />
    )
}
