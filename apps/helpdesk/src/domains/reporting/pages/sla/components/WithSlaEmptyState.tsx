import type { PropsWithChildren } from 'react'
import React from 'react'

import { Skeleton } from '@gorgias/axiom'
import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import { ServiceLevelAgreementsEmptyState } from 'domains/reporting/pages/sla/ServiceLevelAgreementsEmptyState'

export type WithSlaEmptyStateProps = {
    targetChannel?: string
}

export const WithSlaEmptyState = ({
    children,
    targetChannel,
}: PropsWithChildren<WithSlaEmptyStateProps>) => {
    const { data, isLoading } = useListSlaPolicies({
        target_channel: targetChannel,
    })

    if (isLoading) {
        return <Skeleton />
    }

    if (data?.data.data.length === 0) {
        return <ServiceLevelAgreementsEmptyState />
    }
    return <>{children}</>
}
