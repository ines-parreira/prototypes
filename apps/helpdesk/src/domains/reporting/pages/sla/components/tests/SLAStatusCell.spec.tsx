import React from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'

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
            [TicketSLADimension.SlaPolicyMetricName]: anotherMetricName,
            [TicketSLADimension.SlaPolicyMetricStatus]: anotherMetricStatus,
            [TicketSLADimension.SlaDelta]: 123,
            [TicketSLADimension.SlaStatus]: ticketSlaStatus,
        }
        const breachedWithoutDeltaMetricName = 'breachedWithoutDeltaMetric'
        const breachedWithoutDeltaMetric = {
            [TicketSLADimension.SlaPolicyMetricName]:
                breachedWithoutDeltaMetricName,
            [TicketSLADimension.SlaPolicyMetricStatus]: anotherMetricStatus,
            [TicketSLADimension.SlaDelta]: null,
            [TicketSLADimension.SlaStatus]: ticketSlaStatus,
        }
        const slaData = {
            [metricName]: {
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
        const slaStatusBadge = screen.getByText(SlaStatusLabel[ticketSlaStatus])

        act(() => {
            userEvent.hover(slaStatusBadge)
        })

        expect(slaStatusBadge).toBeInTheDocument()
        await waitFor(() => {
            expect(
                screen.getByText(
                    formatDuration(breachedMetric[TicketSLADimension.SlaDelta]),
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    new RegExp(
                        SlaStatusLabel[satisfiedMetricStatus].toLowerCase(),
                    ),
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(new RegExp(PENDING_SLA_TIME_LABEL)),
            ).toBeInTheDocument()
        })
    })
})
