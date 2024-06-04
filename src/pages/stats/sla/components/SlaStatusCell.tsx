import moment from 'moment/moment'
import React, {Fragment} from 'react'
import useId from 'hooks/useId'
import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {SlaStatusLabel} from 'services/reporting/constants'

export type SLAPolicyStatus = {
    [TicketSLADimension.SlaPolicyMetricName]: string
    [TicketSLADimension.SlaPolicyMetricStatus]: TicketSLAStatus
    [TicketSLADimension.SlaDelta]: number | null
}

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
        const status: TicketSLAStatus =
            rowData[sla][TicketSLADimension.SlaPolicyMetricStatus]
        const delta = rowData[sla][TicketSLADimension.SlaDelta]
        const formattedDuration = moment.duration(delta, 'seconds')
        const beforeOrAfter =
            status === TicketSLAStatus.Satisfied ? 'before' : 'after'

        return {
            metricName,
            status,
            delta: Math.abs(formattedDuration.asMinutes()).toPrecision(2),
            beforeOrAfter,
        }
    })
    const rowStatus = formatted.reduce<TicketSLAStatus>(
        (acc, current) =>
            current.status === TicketSLAStatus.Breached
                ? TicketSLAStatus.Breached
                : acc,
        TicketSLAStatus.Satisfied
    )

    return (
        <div>
            <Badge
                id={badgeId}
                type={
                    rowStatus === TicketSLAStatus.Satisfied
                        ? ColorType.LightSuccess
                        : ColorType.LightWarning
                }
            >
                {SlaStatusLabel[rowStatus]}
            </Badge>
            <Tooltip target={badgeId}>
                {formatted.map(({metricName, status, delta, beforeOrAfter}) => (
                    <Fragment key={metricName}>
                        <span>
                            <strong>{metricName}</strong> {status.toLowerCase()}{' '}
                            <strong>{delta}</strong> {beforeOrAfter} due date.
                        </span>
                        <br />
                    </Fragment>
                ))}
            </Tooltip>
        </div>
    )
}
