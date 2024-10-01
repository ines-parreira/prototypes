import {AddressElement, AddressElementProps} from '@stripe/react-stripe-js'
import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {getContactShipping} from 'state/billing/selectors'
import {BillingContact} from 'state/billing/types'

export const StripeAddressElement: React.FC<Partial<AddressElementProps>> = ({
    options,
    ...props
}) => {
    const billingContactShipping: BillingContact['shipping'] =
        useAppSelector(getContactShipping)?.toJS() || {}

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
