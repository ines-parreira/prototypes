import {AddressElement, AddressElementProps} from '@stripe/react-stripe-js'
import React from 'react'
import {useBillingContact} from 'models/billing/queries'

export const StripeAddressElement: React.FC<Partial<AddressElementProps>> = ({
    options,
    ...props
}) => {
    const {data: {data: {shipping: billingContactShipping}} = {data: {}}} =
        useBillingContact()

    return (
        <AddressElement
            options={{
                mode: 'billing',
                fields: {phone: 'always'},
                display: {name: 'organization'},
                validation: {phone: {required: 'always'}},
                defaultValues: billingContactShipping,
                ...options,
            }}
            {...props}
        />
    )
}
