import {useCreateBillingPaymentMethodSetup} from '@gorgias/api-queries'
import {useEffect} from 'react'

export const useSetupIntent = () => {
    const {
        mutate: startSetupIntent,
        data: {data: setupIntent} = {},
        ...status
    } = useCreateBillingPaymentMethodSetup()

    useEffect(() => {
        startSetupIntent()
    }, [startSetupIntent])

    return {
        ...status,
        clientSecret: setupIntent?.client_secret,
    }
}
