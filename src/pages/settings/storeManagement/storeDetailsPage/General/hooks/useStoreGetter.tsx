import { useEffect, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import { useGetIntegration } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { IntegrationType } from 'models/integration/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export default function useStoreGetter(id: number) {
    const dispatch = useAppDispatch()
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
                void dispatch(
                    notify({
                        title: 'Integration type mismatch',
                        message: `The Integration id ${data.data.id} is not a valid store integration.`,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
                history.push('/app/settings/store-management')
                return null
            }

            return data
        }
    }, [data, dispatch, history])

    useEffect(() => {
        if (error) {
            void dispatch(
                notify({
                    title: 'Failed to get integration',
                    message: isGorgiasApiError(error)
                        ? error.response?.data?.error?.msg
                        : 'Failed to get integration',
                    allowHTML: true,
                    status: NotificationStatus.Error,
                }),
            )
            history.push('/app/settings/store-management')
        }
    }, [error, dispatch, history])

    return {
        data: validatedData,
        isFetching,
        refetchStore: refetch,
    }
}
