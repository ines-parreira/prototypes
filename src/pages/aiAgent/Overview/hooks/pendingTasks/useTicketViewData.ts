import { useEffect, useMemo, useState } from 'react'

import { useGetAccountConfiguration } from 'models/aiAgent/queries'
import { useGetViewTicketUpdates } from 'models/view/queries'

export const useTicketViewData = ({
    accountDomain,
}: {
    accountDomain: string
}): { isLoading: boolean; data?: TicketViewData } => {
    const [viewId, setViewId] = useState<number | undefined>(undefined)
    const [ticketId, setTicketId] = useState<number | undefined>(undefined)

    const {
        status: accountConfigurationDataStatus,
        data: accountConfigurationData,
    } = useGetAccountConfiguration(accountDomain)

    useEffect(() => {
        if (accountConfigurationDataStatus !== 'success') {
            return
        }

        setViewId(
            accountConfigurationData.data.accountConfiguration.views?.['Close']
                ?.id,
        )
    }, [
        accountConfigurationDataStatus,
        accountConfigurationData?.data.accountConfiguration,
    ])

    const { data: getViewTicketUpdateData, status: getViewTicketUpdateStatus } =
        useGetViewTicketUpdates(
            {
                viewId: viewId!,
                params: { limit: 1, order_by: 'created_datetime:desc' },
            },
            {
                enabled: !!viewId,
            },
        )

    useEffect(() => {
        if (getViewTicketUpdateStatus !== 'success') {
            return
        }

        setTicketId(getViewTicketUpdateData?.data.data[0]?.id)
    }, [getViewTicketUpdateStatus, getViewTicketUpdateData?.data.data])

    const data = useMemo(() => {
        if (
            accountConfigurationDataStatus === 'loading' ||
            getViewTicketUpdateStatus === 'loading'
        ) {
            return undefined
        }

        return {
            viewId,
            ticketId,
        }
    }, [
        accountConfigurationDataStatus,
        getViewTicketUpdateStatus,
        viewId,
        ticketId,
    ])

    return {
        isLoading:
            accountConfigurationDataStatus === 'loading' ||
            getViewTicketUpdateStatus === 'loading',
        data,
    }
}

export type TicketViewData = {
    viewId?: number
    ticketId?: number
}
