import React, { Fragment } from 'react'

import { useId } from '@repo/hooks'

import { Badge, Tooltip } from '@gorgias/merchant-ui-kit'

import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { formatDuration } from 'domains/reporting/pages/common/utils'
import { SlaStatusLabel } from 'domains/reporting/services/constants'

export type SLAPolicyStatus = {
    [TicketSLADimension.SlaPolicyMetricName]: string
    [TicketSLADimension.SlaPolicyMetricStatus]: TicketSLAStatus
    [TicketSLADimension.SlaDelta]: number | null
    [TicketSLADimension.SlaStatus]: TicketSLAStatus
}

export const PENDING_SLA_TIME_LABEL = 'time pending'

export const SLAStatusCell = ({
    item,
}: {
    item: Record<string, SLAPolicyStatus>
}) => {
    const id = useId()
    const badgeId = `badge-${id}`
    const rowData = item
    const metrics = Object.keys(item)

    const formatted = metrics.map((sla) => {
        const metricName = rowData[sla][TicketSLADimension.SlaPolicyMetricName]
        const metricStatus: TicketSLAStatus =
            rowData[sla][TicketSLADimension.SlaPolicyMetricStatus]
        const ticketStatus: TicketSLAStatus =
            rowData[sla][TicketSLADimension.SlaStatus]
        const delta = rowData[sla][TicketSLADimension.SlaDelta]
        const beforeOrAfter = delta !== null && delta < 0 ? 'before' : 'after'

        return {
            metricName,
            metricStatus,
            ticketStatus,
            delta: delta !== null ? formatDuration(Math.abs(delta)) : null,
            beforeOrAfter,
        }
    })
    const ticketStatus = formatted.reduce<TicketSLAStatus>(
        (acc, current) =>
            current.ticketStatus === TicketSLAStatus.Breached
                ? TicketSLAStatus.Breached
                : acc,
        TicketSLAStatus.Satisfied,
    )

    return (
        <div>
            <Badge
                id={badgeId}
                type={
                    ticketStatus === TicketSLAStatus.Satisfied
                        ? 'light-success'
                        : 'light-warning'
                }
            >
                {SlaStatusLabel[ticketStatus]}
            </Badge>
            <Tooltip target={badgeId}>
                {formatted.map(
                    ({ metricName, metricStatus, delta, beforeOrAfter }) => (
                        <Fragment key={metricName}>
                            <span>
                                <strong>{metricName}</strong>{' '}
                                {SlaStatusLabel[metricStatus].toLowerCase()}{' '}
                                {delta !== null ? (
                                    <>
                                        <strong>{delta}</strong> {beforeOrAfter}{' '}
                                        due date.
                                    </>
                                ) : (
                                    <>{`(${PENDING_SLA_TIME_LABEL})`}</>
                                )}
                            </span>
                            <br />
                        </Fragment>
                    ),
                )}
            </Tooltip>
        </div>
    )
}
