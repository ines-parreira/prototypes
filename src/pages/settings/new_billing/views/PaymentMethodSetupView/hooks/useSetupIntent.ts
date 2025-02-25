import { useEffect } from 'react'

import { useCreateBillingPaymentMethodSetup } from '@gorgias/api-queries'

export const useSetupIntent = () => {
    const {
        mutate: startSetupIntent,
        data: { data: setupIntent } = {},
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
