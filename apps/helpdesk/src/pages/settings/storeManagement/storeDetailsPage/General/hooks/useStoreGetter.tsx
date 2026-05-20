import { useEffect, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/constants'

export default function useStoreGetter(id: number) {
    const history = useHistory()

    const { isFetching, data, error, refetch } = useGetIntegration(id, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    const validatedData = useMemo(() => {
        if (data) {
            if (
                ![
                    IntegrationType.Shopify,
                    IntegrationType.Magento2,
                    IntegrationType.BigCommerce,
                ].includes(data.data.type as IntegrationType)
            ) {
                toast.error('Integration type mismatch')
                history.push('/app/settings/store-management')
                return null
            }

            return data
        }
    }, [data, history])

    useEffect(() => {
        if (error) {
            toast.error('Failed to get integration')
            history.push('/app/settings/store-management')
        }
    }, [error, history])

    return {
        data: validatedData,
        isFetching,
        refetchStore: refetch,
    }
}
