import { StatType } from 'domains/reporting/models/stat/types'
import { getLiveAgentsColumns } from 'domains/reporting/pages/live/agents/dataTable/LiveAgentsTableColumns'
import type { LiveAgentMetricAxis } from 'domains/reporting/pages/live/agents/dataTable/types'

const METRIC_AXES: LiveAgentMetricAxis[] = [
    { name: 'Tickets closed', type: StatType.Number },
    { name: 'Open tickets', type: StatType.TicketDetails },
]

const getHeaders = (columns: ReturnType<typeof getLiveAgentsColumns>) =>
    columns.map((column) => column.header)

describe('getLiveAgentsColumns', () => {
    it('always renders Agent and Online before the metric columns', () => {
        const columns = getLiveAgentsColumns({
            metricAxes: METRIC_AXES,
            isAgentAvailabilityEnabled: false,
        })

        expect(getHeaders(columns)).toEqual([
            'Agent',
            'Online',
            'Tickets closed',
            'Open tickets',
        ])
    })

    it('injects the Availability column after Online when enabled', () => {
        const columns = getLiveAgentsColumns({
            metricAxes: METRIC_AXES,
            isAgentAvailabilityEnabled: true,
        })

        expect(getHeaders(columns)).toEqual([
            'Agent',
            'Online',
            'Availability',
            'Tickets closed',
            'Open tickets',
        ])
    })

    it('renders Agent and Online even without any metric axes', () => {
        const columns = getLiveAgentsColumns({
            metricAxes: [],
            isAgentAvailabilityEnabled: false,
        })

        expect(getHeaders(columns)).toEqual(['Agent', 'Online'])
    })
})
