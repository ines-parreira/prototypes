import type { PropsWithChildren } from 'react'
import React from 'react'

import { Skeleton } from '@gorgias/axiom'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import { ServiceLevelAgreementsEmptyState } from 'domains/reporting/pages/sla/ServiceLevelAgreementsEmptyState'

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
