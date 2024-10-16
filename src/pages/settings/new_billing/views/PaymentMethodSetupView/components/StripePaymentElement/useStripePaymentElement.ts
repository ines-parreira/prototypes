import {useElements} from '@stripe/react-stripe-js'
import {useEffect, useState} from 'react'

export const useStripePaymentElement = () => {
    const elements = useElements()

    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        elements?.getElement('payment')?.on('change', (event) => {
            setIsComplete(event.complete)
        })
    })

    return {
        isComplete,
    }
}
