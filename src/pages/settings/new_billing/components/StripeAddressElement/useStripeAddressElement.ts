import {useElements} from '@stripe/react-stripe-js'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {useEffect, useRef, useState} from 'react'

import {validatePostalCode} from '../../utils/validations'

export const useStripeAddressElement = () => {
    const elements = useElements()

    const valueRef = useRef<StripeAddressElementChangeEvent['value']>()

    const [error, setError] = useState<string>()

    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        elements?.getElement('address')?.on('change', (event) => {
            valueRef.current = event.value

            const postalCodeError = validatePostalCode(
                event.value.address.postal_code,
                event.value.address.country ?? ''
            )

            /* We're handling this validation as a "global" validation/error
            // because we cannot show the error in the Stripe address field,
            // so this will be shown below the submit button instead.
            // We only show the "global" zip code error if/when the address
            // element form was succesfuly completed */
            setError(event.complete ? postalCodeError : undefined)

            setIsComplete(!postalCodeError && event.complete)
        })

        elements?.getElement('address')?.on('blur', () => {
            // Triggers Stripe address element validation on blur (when the user clicks outside the field)
            void elements.getElement('address')?.getValue()
        })
    }, [elements])

    return {
        getSelf: () => elements?.getElement('address'),
        getValue: () => valueRef.current,
        error,
        isComplete,
    }
}
