import React, { PropsWithChildren } from 'react'

import { useListSlaPolicies } from '@gorgias/helpdesk-queries'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { ServiceLevelAgreementsEmptyState } from 'pages/stats/sla/ServiceLevelAgreementsEmptyState'

export const WithSlaEmptyState = ({ children }: PropsWithChildren<unknown>) => {
    const { data, isLoading } = useListSlaPolicies()

    if (isLoading) {
        return <Skeleton />
    }

    if (data?.data.data.length === 0) {
        return <ServiceLevelAgreementsEmptyState />
    }
    return <>{children}</>
}
