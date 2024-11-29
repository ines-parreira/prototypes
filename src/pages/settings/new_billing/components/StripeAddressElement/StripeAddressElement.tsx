import {AddressElement, AddressElementProps} from '@stripe/react-stripe-js'
import React from 'react'

export const StripeAddressElement: React.FC<Partial<AddressElementProps>> = ({
    options,
    ...props
}) => {
    return (
        <AddressElement
            options={{
                mode: 'billing',
                fields: {phone: 'always'},
                display: {name: 'organization'},
                validation: {phone: {required: 'never'}},
                ...options,
            }}
            {...props}
        />
    )
}
