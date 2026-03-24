import { render } from '@testing-library/react'

import { ConversationFunnelCard } from 'AIJourney/components/ConversationFunnelCard/ConversationFunnelCard'
import { useAIJourneySankeyMetrics } from 'AIJourney/hooks'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'

import { AiJourneySankeyChart } from './AiJourneySankeyChart'

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useAIJourneySankeyMetrics: jest.fn(),
}))

jest.mock(
    'AIJourney/components/ConversationFunnelCard/ConversationFunnelCard',
    () => ({
        ...jest.requireActual(
            'AIJourney/components/ConversationFunnelCard/ConversationFunnelCard',
        ),
        ConversationFunnelCard: jest.fn(() => null),
    }),
)

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

const mockUseAIJourneySankeyMetrics = useAIJourneySankeyMetrics as jest.Mock
const mockConversationFunnelCard = ConversationFunnelCard as jest.Mock

const defaultData = { nodes: [], links: [] }

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

describe('<AiJourneySankeyChart />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIJourneySankeyMetrics.mockReturnValue({
            data: defaultData,
            isLoading: false,
            isError: false,
        })
    })

    it('should call useAIJourneySankeyMetrics with the correct arguments', () => {
        render(<AiJourneySankeyChart {...defaultProps} />)

        expect(mockUseAIJourneySankeyMetrics).toHaveBeenCalledWith(
            defaultProps.integrationId,
            defaultProps.userTimezone,
            defaultProps.filters,
            defaultProps.journeyIds,
        )
    })

    it('should pass isLoading=true to ConversationFunnelCard when the hook is loading', () => {
        mockUseAIJourneySankeyMetrics.mockReturnValue({
            data: defaultData,
            isLoading: true,
            isError: false,
        })

        render(<AiJourneySankeyChart {...defaultProps} />)

        expect(mockConversationFunnelCard).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
            expect.anything(),
        )
    })

    it('should pass isLoading=false to ConversationFunnelCard when the hook is not loading', () => {
        render(<AiJourneySankeyChart {...defaultProps} />)

        expect(mockConversationFunnelCard).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: false }),
            expect.anything(),
        )
    })

    it('should pass data from the hook to ConversationFunnelCard', () => {
        const mockData = {
            nodes: [{ name: 'Conversations', color: '#B7A7FF' }],
            links: [],
        }
        mockUseAIJourneySankeyMetrics.mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
        })

        render(<AiJourneySankeyChart {...defaultProps} />)

        expect(mockConversationFunnelCard).toHaveBeenCalledWith(
            expect.objectContaining({ data: mockData }),
            expect.anything(),
        )
    })

    it('should pass the correct hoverableNodeNames to ConversationFunnelCard', () => {
        render(<AiJourneySankeyChart {...defaultProps} />)

        expect(mockConversationFunnelCard).toHaveBeenCalledWith(
            expect.objectContaining({
                hoverableNodeNames: [
                    'Replied + used discount',
                    'Replied + clicked',
                    'Replied only',
                    'Used discount (no reply)',
                    'Clicked (no reply)',
                    'No engagement',
                ],
            }),
            expect.anything(),
        )
    })

    describe('onLinkClick', () => {
        const triggerLinkClick = (sourceName: string) => {
            const [{ onLinkClick }] = mockConversationFunnelCard.mock.calls[0]
            onLinkClick({
                source: { name: sourceName, color: '#7E55F6' },
                target: { name: 'Converted', color: '#7E55F6' },
                value: 10,
                linkIndex: 0,
            })
        }

        it.each([
            ['Replied + used discount', 'replied_and_used_discount'],
            ['Replied + clicked', 'replied_and_clicked'],
            ['Replied only', 'replied_only'],
            ['Used discount (no reply)', 'used_discount_no_reply'],
            ['Clicked (no reply)', 'clicked_no_reply'],
            ['No engagement', 'no_engagement'],
        ])(
            'should dispatch setMetricData with the correct engagementCategory for "%s"',
            (nodeName, expectedCategory) => {
                render(<AiJourneySankeyChart {...defaultProps} />)
                triggerLinkClick(nodeName)

                expect(mockDispatch).toHaveBeenCalledWith(
                    setMetricData({
                        title: `Converted – ${nodeName}`,
                        metricName: AIJourneyMetric.SankeyConversions,
                        integrationId: defaultProps.integrationId,
                        journeyIds: defaultProps.journeyIds.map(String),
                        engagementCategory: expectedCategory,
                    }),
                )
            },
        )

        it('should dispatch setMetricData with journeyIds=undefined when journeyIds is empty', () => {
            render(<AiJourneySankeyChart {...defaultProps} journeyIds={[]} />)
            triggerLinkClick('Replied + clicked')

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({ journeyIds: undefined }),
                ),
            )
        })

        it('should dispatch setMetricData with journeyIds mapped to strings', () => {
            render(
                <AiJourneySankeyChart
                    {...defaultProps}
                    journeyIds={['j1', 'j2']}
                />,
            )
            triggerLinkClick('Replied + clicked')

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({ journeyIds: ['j1', 'j2'] }),
                ),
            )
        })

        it('should include the integrationId in the dispatched payload', () => {
            render(
                <AiJourneySankeyChart
                    {...defaultProps}
                    integrationId="integration-456"
                />,
            )
            triggerLinkClick('No engagement')

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        integrationId: 'integration-456',
                    }),
                ),
            )
        })

        it('should include the SankeyConversions metricName in the dispatched payload', () => {
            render(<AiJourneySankeyChart {...defaultProps} />)
            triggerLinkClick('Replied only')

            expect(mockDispatch).toHaveBeenCalledWith(
                setMetricData(
                    expect.objectContaining({
                        metricName: AIJourneyMetric.SankeyConversions,
                    }),
                ),
            )
        })
    })
})
