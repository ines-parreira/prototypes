import { useEffect, useRef, useState } from 'react'

import { useElements } from '@stripe/react-stripe-js'
import type { StripePaymentElementChangeEvent } from '@stripe/stripe-js'

export const useStripeElementPaymentState = <Selected>(
    selector: (state: StripePaymentElementChangeEvent) => Selected = (state) =>
        state as Selected,
) => {
    const selectorRef = useRef(selector)
    selectorRef.current = selector

    const paymentElement = useElements()?.getElement('payment')

    const [selected, setSelected] = useState<Selected>()

    useEffect(() => {
        paymentElement?.on('change', (event) => {
            setSelected(selectorRef.current(event))
        })
    }, [paymentElement])

    return selected
}
