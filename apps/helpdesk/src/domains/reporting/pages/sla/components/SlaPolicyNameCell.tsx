import { useMemo } from 'react'

import { NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'

import { useListSlaPolicies } from '@gorgias/helpdesk-queries'

import { TicketSLADimension } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import type { TicketSLAPolicyDrilldownItem } from 'domains/reporting/models/cubes/sla/TicketSLACube'

export const SlaPolicyNameCell = ({
    item,
}: {
    item: Record<string, TicketSLAPolicyDrilldownItem>
}) => {
    const { data } = useListSlaPolicies()
    const policies = useMemo(() => data?.data.data || [], [data?.data.data])

    const policyNames = useMemo(() => {
        const uuids = [
            ...new Set(
                Object.values(item).map(
                    (v) => v[TicketSLADimension.SlaPolicyUuid],
                ),
            ),
        ]
        return uuids.map(
            (uuid) =>
                policies.find((policy) => policy.uuid === uuid)?.name ?? null,
        )
    }, [item, policies])

    if (policyNames.length === 0 || policyNames.every((n) => n === null)) {
        return <>{NOT_AVAILABLE_PLACEHOLDER}</>
    }

    return <>{policyNames.filter(Boolean).join(', ')}</>
}
