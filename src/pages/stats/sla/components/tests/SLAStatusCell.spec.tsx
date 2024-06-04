import {render, screen} from '@testing-library/react'
import React from 'react'
import {
    TicketSLADimension,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {SLAStatusCell} from 'pages/stats/sla/components/SlaStatusCell'
import {SlaStatusLabel} from 'services/reporting/constants'

describe('<SLAStatusCell />', () => {
    it("should render Ticket SLA's status with metrics in a tooltip", () => {
        const metricName = 'someMetric'
        const metricStatus = TicketSLAStatus.Satisfied
        const slaData = {
            [metricName]: {
                [TicketSLADimension.SlaPolicyMetricName]: metricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: metricStatus,
                [TicketSLADimension.SlaDelta]: null,
            },
        }
        render(<SLAStatusCell item={slaData} />)

        expect(screen.getByText(SlaStatusLabel[metricStatus]))
    })

    it('should render Breached status if at least one metric is breached', () => {
        const metricName = 'someMetric'
        const metricStatus = TicketSLAStatus.Satisfied
        const anotherMetricName = 'anotherMetric'
        const anotherMetricStatus = TicketSLAStatus.Breached
        const slaData = {
            [metricName]: {
                [TicketSLADimension.SlaPolicyMetricName]: metricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: metricStatus,
                [TicketSLADimension.SlaDelta]: null,
            },
            [anotherMetricName]: {
                [TicketSLADimension.SlaPolicyMetricName]: anotherMetricName,
                [TicketSLADimension.SlaPolicyMetricStatus]: anotherMetricStatus,
                [TicketSLADimension.SlaDelta]: null,
            },
        }
        render(<SLAStatusCell item={slaData} />)

        expect(screen.getByText(SlaStatusLabel[anotherMetricStatus]))
    })
})
