import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAIJourneyAudienceHealthMetrics } from 'AIJourney/hooks/useAIJourneyAudienceHealthMetrics/useAIJourneyAudienceHealthMetrics'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

import { AudienceHealthSection } from './AudienceHealthSection'

jest.mock(
    'AIJourney/hooks/useAIJourneyAudienceHealthMetrics/useAIJourneyAudienceHealthMetrics',
)
jest.mock('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')

const mockUseAIJourneyAudienceHealthMetrics =
    useAIJourneyAudienceHealthMetrics as jest.Mock

const mockUseDrillDownModalTrigger = useDrillDownModalTrigger as jest.Mock

const defaultProps = {
    integrationId: '123',
    userTimezone: 'America/New_York',
    filters: {
        period: {
            start_datetime: '2025-07-01T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    },
    shopName: 'test-shop',
    journeyIds: ['journey-1'],
}

const makeTotalConversationsMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Recipients', value: 1200, prevValue: 1000 },
    },
    interpretAs: 'more-is-better',
    metricFormat: 'decimal-precision-1',
    hint: {
        title: 'Unique customers who received at least 1 message during the selected date range.',
    },
    drilldownMetricName: AIJourneyMetric.TotalConversations,
    ...overrides,
})

const makeOptOutRateMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Opt-out rate', value: 5, prevValue: 4 },
    },
    interpretAs: 'less-is-better',
    metricFormat: 'percent',
    hint: {
        title: 'Percentage of recipients who unsubscribed after receiving a message.',
    },
    ...overrides,
})

const makeTotalOptOutsMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Total opted-out', value: 60, prevValue: 40 },
    },
    interpretAs: 'less-is-better',
    metricFormat: 'decimal',
    hint: {
        title: 'Total number of recipients who unsubscribed after receiving a message.',
    },
    drilldownMetricName: AIJourneyMetric.TotalOptOuts,
    ...overrides,
})

const makeTotalRepliesMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Recipients who replied', value: 300, prevValue: 250 },
    },
    interpretAs: 'more-is-better',
    metricFormat: 'decimal',
    hint: {
        title: 'The number of recipients who sent a reply to the received message.',
    },
    drilldownMetricName: AIJourneyMetric.TotalReplies,
    ...overrides,
})

const makeOptOutAfterReplyRateMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Opt-out rate after reply', value: 10, prevValue: 8 },
    },
    interpretAs: 'less-is-better',
    metricFormat: 'percent',
    hint: {
        title: 'Percentage of recipients who unsubscribed after first replying to the message.',
    },
    ...overrides,
})

const makeOptedOutAfterReplyMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Opted-out after reply', value: 30, prevValue: 20 },
    },
    interpretAs: 'less-is-better',
    metricFormat: 'decimal',
    hint: {
        title: 'The number of recipients who replied to the message and then unsubscribed.',
    },
    drilldownMetricName: AIJourneyMetric.OptOutAfterReply,
    ...overrides,
})

const defaultMetrics = () => [
    makeTotalConversationsMetric(),
    makeOptOutRateMetric(),
    makeTotalOptOutsMetric(),
    makeTotalRepliesMetric(),
    makeOptOutAfterReplyRateMetric(),
    makeOptedOutAfterReplyMetric(),
]

const mockOpenDrillDownModal = jest.fn()

describe('<AudienceHealthSection />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIJourneyAudienceHealthMetrics.mockReturnValue(defaultMetrics())
        mockUseDrillDownModalTrigger.mockReturnValue({
            openDrillDownModal: mockOpenDrillDownModal,
            tooltipText: 'Click to view associated tickets',
        })
    })

    it('should render the section heading', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: 'Audience health' }),
        ).toBeInTheDocument()
    })

    it('should render all metric card labels', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(screen.getByText('Recipients')).toBeInTheDocument()
        expect(screen.getByText('Opt-out rate')).toBeInTheDocument()
        expect(screen.getByText('Total opted-out')).toBeInTheDocument()
        expect(screen.getByText('Recipients who replied')).toBeInTheDocument()
        expect(screen.getByText('Opt-out rate after reply')).toBeInTheDocument()
        expect(screen.getByText('Opted-out after reply')).toBeInTheDocument()
    })

    it('should pass props down to the hook', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(mockUseAIJourneyAudienceHealthMetrics).toHaveBeenCalledWith(
            defaultProps.integrationId,
            defaultProps.userTimezone,
            defaultProps.filters,
            defaultProps.shopName,
            defaultProps.journeyIds,
        )
    })

    it('should show loading state when a metric is fetching', () => {
        mockUseAIJourneyAudienceHealthMetrics.mockReturnValue([
            makeTotalConversationsMetric({
                trend: {
                    isFetching: true,
                    isError: false,
                    data: { label: 'Recipients', value: null, prevValue: null },
                },
            }),
            makeOptOutRateMetric(),
            makeTotalOptOutsMetric(),
            makeTotalRepliesMetric(),
            makeOptOutAfterReplyRateMetric(),
            makeOptedOutAfterReplyMetric(),
        ])

        render(<AudienceHealthSection {...defaultProps} />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render metric values when loaded', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(screen.getByText('60')).toBeInTheDocument()
        expect(screen.getByText('300')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('should render an empty list when hook returns no metrics', () => {
        mockUseAIJourneyAudienceHealthMetrics.mockReturnValue([])

        render(<AudienceHealthSection {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: 'Audience health' }),
        ).toBeInTheDocument()
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
    })

    it('should call useDrillDownModalTrigger for TotalConversations metric', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.TotalConversations,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should call useDrillDownModalTrigger for TotalOptOuts metric', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.TotalOptOuts,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should call useDrillDownModalTrigger for TotalReplies metric', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.TotalReplies,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should call useDrillDownModalTrigger for OptOutAfterReply metric', () => {
        render(<AudienceHealthSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.OptOutAfterReply,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should open drill-down modal when clicking on TotalOptOuts metric value', async () => {
        const user = userEvent.setup()
        render(<AudienceHealthSection {...defaultProps} />)

        await act(async () => {
            await user.click(screen.getByText('60'))
        })

        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should open drill-down modal when clicking on TotalReplies metric value', async () => {
        const user = userEvent.setup()
        render(<AudienceHealthSection {...defaultProps} />)
        await act(async () => {
            await user.click(screen.getByText('300'))
        })

        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should open drill-down modal when clicking on OptedOutAfterReply metric value', async () => {
        const user = userEvent.setup()
        render(<AudienceHealthSection {...defaultProps} />)
        await act(async () => {
            await user.click(screen.getByText('30'))
        })

        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should not open drill-down modal when clicking on OptOutRate metric value', async () => {
        const user = userEvent.setup()
        render(<AudienceHealthSection {...defaultProps} />)
        await act(async () => {
            await user.click(screen.getByText(/^5%/))
        })

        expect(mockOpenDrillDownModal).not.toHaveBeenCalled()
    })

    it('should not open drill-down modal when clicking on OptOutAfterReplyRate metric value', async () => {
        const user = userEvent.setup()
        render(<AudienceHealthSection {...defaultProps} />)
        await act(async () => {
            await user.click(screen.getByText(/^10%/))
        })

        expect(mockOpenDrillDownModal).not.toHaveBeenCalled()
    })
})
