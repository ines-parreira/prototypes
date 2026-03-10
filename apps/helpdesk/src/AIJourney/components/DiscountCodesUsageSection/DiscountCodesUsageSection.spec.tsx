import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAIJourneyDiscountCodeUsageMetrics } from 'AIJourney/hooks'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

import { DiscountCodesUsageSection } from './DiscountCodesUsageSection'

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useAIJourneyDiscountCodeUsageMetrics: jest.fn(),
}))

jest.mock('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')

const mockUseAIJourneyDiscountCodeUsageMetrics =
    useAIJourneyDiscountCodeUsageMetrics as jest.Mock

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
    journeyIds: ['journey-1'],
}

const makeOfferedMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Discount codes generated', value: 100, prevValue: 80 },
    },
    interpretAs: 'more-is-better',
    metricFormat: 'decimal',
    hint: {
        title: 'The total number of unique discount codes generated during selected date range.',
    },
    drilldownMetricName: AIJourneyMetric.DiscountCodesGenerated,
    ...overrides,
})

const makeUsedMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Discount codes used', value: 40, prevValue: 20 },
    },
    interpretAs: 'more-is-better',
    metricFormat: 'decimal',
    hint: {
        title: 'The number of discount codes that were redeemed by recipients.',
    },
    drilldownMetricName: AIJourneyMetric.DiscountCodesUsed,
    ...overrides,
})

const makeRateMetric = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: {
            label: 'Discount code usage rate',
            value: 0.4,
            prevValue: 0.25,
        },
    },
    interpretAs: 'more-is-better',
    metricFormat: 'percent',
    hint: {
        title: 'The percentage of generated discount codes that were redeemed. Calculated as codes used divided by codes generated * 100.',
    },
    ...overrides,
})

const mockOpenDrillDownModal = jest.fn()

describe('<DiscountCodesUsageSection />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIJourneyDiscountCodeUsageMetrics.mockReturnValue([
            makeOfferedMetric(),
            makeUsedMetric(),
            makeRateMetric(),
        ])
        mockUseDrillDownModalTrigger.mockReturnValue({
            openDrillDownModal: mockOpenDrillDownModal,
            tooltipText: 'Click to view associated tickets',
        })
    })

    it('should render the section heading', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: 'Discount codes usage' }),
        ).toBeInTheDocument()
    })

    it('should render all three metric card labels', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(screen.getByText('Discount codes generated')).toBeInTheDocument()
        expect(screen.getByText('Discount codes used')).toBeInTheDocument()
        expect(screen.getByText('Discount code usage rate')).toBeInTheDocument()
    })

    it('should pass props down to the hook', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(mockUseAIJourneyDiscountCodeUsageMetrics).toHaveBeenCalledWith(
            defaultProps.integrationId,
            defaultProps.userTimezone,
            defaultProps.filters,
            defaultProps.journeyIds,
        )
    })

    it('should show loading state when a metric is fetching', () => {
        mockUseAIJourneyDiscountCodeUsageMetrics.mockReturnValue([
            makeOfferedMetric({
                trend: {
                    isFetching: true,
                    isError: false,
                    data: {
                        label: 'Discount codes generated',
                        value: null,
                        prevValue: null,
                    },
                },
            }),
            makeUsedMetric(),
            makeRateMetric({
                trend: {
                    isFetching: true,
                    isError: false,
                    data: {
                        label: 'Discount code usage rate',
                        value: null,
                        prevValue: null,
                    },
                },
            }),
        ])

        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render metric values when loaded', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('40')).toBeInTheDocument()
        expect(screen.getByText(/0\.4%/)).toBeInTheDocument()
    })

    it('should call useDrillDownModalTrigger for DiscountCodesGenerated metric', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.DiscountCodesGenerated,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should call useDrillDownModalTrigger for DiscountCodesUsed metric', () => {
        render(<DiscountCodesUsageSection {...defaultProps} />)

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AIJourneyMetric.DiscountCodesUsed,
            integrationId: defaultProps.integrationId,
            journeyIds: defaultProps.journeyIds,
        })
    })

    it('should open drilldown modal when clicking on discount codes generated metric value', async () => {
        const user = userEvent.setup()
        render(<DiscountCodesUsageSection {...defaultProps} />)

        await user.click(screen.getByText('100'))

        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should open drilldown modal when clicking on discount codes used metric value', async () => {
        const user = userEvent.setup()
        render(<DiscountCodesUsageSection {...defaultProps} />)

        await user.click(screen.getByText('40'))

        expect(mockOpenDrillDownModal).toHaveBeenCalledTimes(1)
    })

    it('should not pass drillDown prop to the rate metric card', async () => {
        const user = userEvent.setup()
        render(<DiscountCodesUsageSection {...defaultProps} />)

        await user.click(screen.getByText(/0\.4%/))

        expect(mockOpenDrillDownModal).not.toHaveBeenCalled()
    })
})
