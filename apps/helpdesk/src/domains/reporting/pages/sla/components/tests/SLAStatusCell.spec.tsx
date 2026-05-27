import React from 'react'

import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { formatDuration } from 'domains/reporting/pages/common/utils'
import {
    PENDING_SLA_TIME_LABEL,
    SLAStatusCell,
} from 'domains/reporting/pages/sla/components/SlaStatusCell'
import { SlaStatusLabel } from 'domains/reporting/services/constants'

describe('<SLAStatusCell />', () => {
    it("should render Ticket SLA's status with metrics in a tooltip", () => {
        const metricName = 'someMetric'
        const metricStatus = TicketSLAStatus.Satisfied
        const slaData = {
            [metricName]: {
                [TicketSLADimension.SlaPolicyUuid]: 'aaaa-bbbb-cccc-dddd',
                [TicketSLADimension.SlaPolicyMetricName]: metricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: metricStatus,
                [TicketSLADimension.SlaDelta]: null,
                [TicketSLADimension.SlaStatus]: metricStatus,
            },
        }
        render(<SLAStatusCell item={slaData} />)

        expect(screen.getByText(SlaStatusLabel[metricStatus]))
    })

    it('should render ticket status and metric details', async () => {
        const metricName = 'someMetric'
        const ticketSlaStatus = TicketSLAStatus.Breached
        const satisfiedMetricStatus = TicketSLAStatus.Satisfied
        const anotherMetricName = 'anotherMetric'
        const anotherMetricStatus = TicketSLAStatus.Breached
        const breachedMetric = {
            [TicketSLADimension.SlaPolicyUuid]: 'aaaa-bbbb-cccc-dddd',
            [TicketSLADimension.SlaPolicyMetricName]: anotherMetricName,
            [TicketSLADimension.SlaPolicyMetricStatus]: anotherMetricStatus,
            [TicketSLADimension.SlaDelta]: 123,
            [TicketSLADimension.SlaStatus]: ticketSlaStatus,
        }
        const breachedWithoutDeltaMetricName = 'breachedWithoutDeltaMetric'
        const breachedWithoutDeltaMetric = {
            [TicketSLADimension.SlaPolicyUuid]: 'aaaa-bbbb-cccc-dddd',
            [TicketSLADimension.SlaPolicyMetricName]:
                breachedWithoutDeltaMetricName,
            [TicketSLADimension.SlaPolicyMetricStatus]: anotherMetricStatus,
            [TicketSLADimension.SlaDelta]: null,
            [TicketSLADimension.SlaStatus]: ticketSlaStatus,
        }
        const slaData = {
            [metricName]: {
                [TicketSLADimension.SlaPolicyUuid]: 'aaaa-bbbb-cccc-dddd',
                [TicketSLADimension.SlaPolicyMetricName]: metricName,
                [TicketSLADimension.SlaPolicyMetricStatus]:
                    satisfiedMetricStatus,
                [TicketSLADimension.SlaDelta]: -456,
                [TicketSLADimension.SlaStatus]: ticketSlaStatus,
            },
            [anotherMetricName]: breachedMetric,
            [breachedWithoutDeltaMetricName]: breachedWithoutDeltaMetric,
        }

        render(<SLAStatusCell item={slaData} />)
        const user = userEvent.setup()
        const slaStatusBadge = screen.getByText(SlaStatusLabel[ticketSlaStatus])

        await act(async () => {
            await user.hover(slaStatusBadge)
        })

        expect(slaStatusBadge).toBeInTheDocument()
        const tooltip = await screen.findByRole('tooltip')

        expect(tooltip).toHaveTextContent(
            formatDuration(breachedMetric[TicketSLADimension.SlaDelta]),
        )
        expect(tooltip).toHaveTextContent(
            SlaStatusLabel[satisfiedMetricStatus].toLowerCase(),
        )
        expect(tooltip).toHaveTextContent(PENDING_SLA_TIME_LABEL)
    })
})
