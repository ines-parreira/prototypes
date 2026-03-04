import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import * as automatedInteractionsBySkillHook from 'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill'
import * as automateFiltersHook from 'domains/reporting/hooks/automate/useAutomateFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import * as automatedInteractionsMetricHook from '../../../analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric'
import { AnalyticsOverviewAutomatedInteractionsComboChart } from '../AnalyticsOverviewAutomatedInteractionsComboChart'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock('domains/reporting/hooks/automate/useAutomatedInteractionsBySkill')
jest.mock(
    '../../../analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric',
)

describe('AnalyticsOverviewAutomatedInteractionsComboChart', () => {
    const mockChartData = [
        { name: 'Support Agent', value: 800 },
        { name: 'Shopping Assistant', value: 200 },
    ]

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        jest.spyOn(automateFiltersHook, 'useAutomateFilters').mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        jest.spyOn(
            automatedInteractionsMetricHook,
            'useAiAgentAutomatedInteractionsMetric',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 1000,
                prevValue: 900,
            },
        })

        jest.spyOn(
            automatedInteractionsBySkillHook,
            'useAutomatedInteractionsBySkill',
        ).mockReturnValue({
            data: mockChartData,
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should render the metric value from the hook', () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('should render chart controls with donut and bar buttons', () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(
            screen.getByRole('radio', { name: /chart-pie/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /chart-bar-vertical/i }),
        ).toBeInTheDocument()
    })

    it('should have donut chart selected by default', () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(
            screen.getByRole('radio', { name: /chart-pie/i }),
        ).toHaveAttribute('aria-checked', 'true')
    })

    it('should render all legend items', () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getByText('Support Agent')).toBeInTheDocument()
        expect(screen.getByText('Shopping Assistant')).toBeInTheDocument()
    })

    it('should render loading skeleton when chart data is loading', () => {
        jest.spyOn(
            automatedInteractionsBySkillHook,
            'useAutomatedInteractionsBySkill',
        ).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        })

        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render loading skeleton when metric is fetching', () => {
        jest.spyOn(
            automatedInteractionsMetricHook,
            'useAiAgentAutomatedInteractionsMetric',
        ).mockReturnValue({
            isFetching: true,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            },
        })

        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should filter out chart data items with value 0', () => {
        jest.spyOn(
            automatedInteractionsBySkillHook,
            'useAutomatedInteractionsBySkill',
        ).mockReturnValue({
            data: [
                { name: 'Support Agent', value: 800 },
                { name: 'Shopping Assistant', value: 0 },
            ],
            isLoading: false,
            isError: false,
        })

        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getByText('Support Agent')).toBeInTheDocument()
        expect(screen.queryByText('Shopping Assistant')).not.toBeInTheDocument()
    })

    it('should handle null metric value', () => {
        jest.spyOn(
            automatedInteractionsMetricHook,
            'useAiAgentAutomatedInteractionsMetric',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            },
        })

        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should switch to bar chart when bar button is clicked', async () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should switch back to donut chart when donut button is clicked', async () => {
        render(<AnalyticsOverviewAutomatedInteractionsComboChart />)

        const barButton = screen.getByRole('radio', {
            name: /chart-bar-vertical/i,
        })
        const donutButton = screen.getByRole('radio', {
            name: /chart-pie/i,
        })

        await act(async () => {
            await userEvent.click(barButton)
        })

        expect(barButton).toHaveAttribute('aria-checked', 'true')

        await act(async () => {
            await userEvent.click(donutButton)
        })

        expect(donutButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render responsive container for the chart', () => {
        const { container } = render(
            <AnalyticsOverviewAutomatedInteractionsComboChart />,
        )

        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeInTheDocument()
    })
})
