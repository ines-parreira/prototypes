import {useListSlaPolicies} from '@gorgias/api-queries'
import React, {PropsWithChildren} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {ServiceLevelAgreementsEmptyState} from 'pages/stats/sla/ServiceLevelAgreementsEmptyState'

export const WithSlaEmptyState = ({children}: PropsWithChildren<unknown>) => {
    const {data, isLoading} = useListSlaPolicies()

    if (isLoading) {
        return <Skeleton />
    }

    if (data?.data.data.length === 0) {
        return <ServiceLevelAgreementsEmptyState />
    }
    return <>{children}</>
}
