import { useFlagWithLoading } from '@repo/feature-flags'
import { ConfigurableGraph } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import { AiAgentConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper'

jest.mock('@repo/feature-flags')
jest.mock('domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference')
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    ConfigurableGraph: jest.fn(
        ({ actionMenu }: { actionMenu?: React.ReactNode }) => (
            <div>
                ConfigurableGraph
                {actionMenu}
            </div>
        ),
    ),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))

const useFlagWithLoadingMock = assumeMock(useFlagWithLoading)
const useSaveCustomDashboardPreferenceMock = assumeMock(
    useSaveCustomDashboardPreference,
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
const ConfigurableGraphMock = assumeMock(ConfigurableGraph)

const metrics = [] as any

const chartConfig: ChartConfig = {
    chartComponent: () => <div />,
    label: 'Automation rate',
    csvProducer: null,
    chartType: ChartType.Graph,
}

const dashboard: DashboardSchema = {
    id: 1,
    name: 'My Dashboard',
    analytics_filter_id: null,
    children: [],
    emoji: null,
}

const schema: DashboardChartSchema = {
    type: DashboardChildType.Chart,
    config_id: 'ai_agent_all_agents_configurable_bar',
}

describe('AiAgentConfigurableGraphWrapper', () => {
    beforeEach(() => {
        useFlagWithLoadingMock.mockReturnValue({
            value: true,
            isLoading: false,
        })
        useSaveCustomDashboardPreferenceMock.mockReturnValue({
            savePreferences: jest.fn(),
        })
        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('action menu', () => {
        it('renders when enableCustomDashboards flag is on and chartId and chartConfig are provided', () => {
            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    chartId="chart-1"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                    customDashboardChartSchema={schema}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    chartId: 'chart-1',
                    dashboard,
                    chartName: chartConfig.label,
                }),
                {},
            )
        })

        it('does not render when enableCustomDashboards flag is off', () => {
            useFlagWithLoadingMock.mockReturnValue({
                value: false,
                isLoading: false,
            })

            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    chartId="chart-1"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
        })

        it('does not render when chartId is missing', () => {
            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
        })

        it('does not render when chartConfig is missing', () => {
            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    chartId="chart-1"
                    dashboard={dashboard}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
        })
    })

    describe('save preferences', () => {
        it('passes dashboard to useSaveCustomDashboardPreference when provided', () => {
            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    dashboard={dashboard}
                    customDashboardChartSchema={schema}
                />,
            )

            expect(useSaveCustomDashboardPreferenceMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dashboard,
                    configId: schema.config_id,
                }),
            )
        })

        it('passes undefined dashboard to useSaveCustomDashboardPreference when no dashboard', () => {
            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                    customDashboardChartSchema={schema}
                />,
            )

            expect(useSaveCustomDashboardPreferenceMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dashboard: undefined,
                    configId: schema.config_id,
                }),
            )
        })

        it('passes savePreferences as onSelect to ConfigurableGraph', () => {
            const savePreferences = jest.fn()
            useSaveCustomDashboardPreferenceMock.mockReturnValue({
                savePreferences,
            })

            render(
                <AiAgentConfigurableGraphWrapper
                    metrics={metrics}
                    analyticsChartId="chart"
                />,
            )

            expect(ConfigurableGraphMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onSelect: savePreferences,
                }),
                {},
            )
        })
    })
})
