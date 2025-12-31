import { assumeMock, renderHook } from '@repo/testing'

import {
    useHandoverInteractionsPerIntent,
    useSnoozedInteractionsPerIntent,
    useTotalInteractionsPerIntent,
} from 'domains/reporting/hooks/ai-agent-insights/intentMetrics'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { useIntentPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/ai-agent-insights/intentMetrics', () => ({
    useHandoverInteractionsPerIntent: jest.fn(),
    useSnoozedInteractionsPerIntent: jest.fn(),
    useTotalInteractionsPerIntent: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(),
    }),
)

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({
        useMoneySavedPerInteractionWithAutomate: jest.fn(),
    }),
)

const useHandoverInteractionsPerIntentMock = assumeMock(
    useHandoverInteractionsPerIntent,
)
const useSnoozedInteractionsPerIntentMock = assumeMock(
    useSnoozedInteractionsPerIntent,
)
const useTotalInteractionsPerIntentMock = assumeMock(
    useTotalInteractionsPerIntent,
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
const useMoneySavedPerInteractionWithAutomateMock = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

describe('useIntentPerformanceMetrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const intentCustomFieldId = 5253
    const outcomeCustomFieldId = 5254
    const costSavedPerInteraction = 10

    beforeEach(() => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            intentCustomFieldId,
            outcomeCustomFieldId,
        } as any)
        useMoneySavedPerInteractionWithAutomateMock.mockReturnValue(
            costSavedPerInteraction,
        )
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })
        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })
        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return empty data when all queries return null', () => {
        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return loading state when any query is fetching', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
    })

    it('should return error state when any query has error', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.isError).toBe(true)
    })

    it('should aggregate data from multiple intent levels correctly', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status::Update',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 10,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status::Other',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 5,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status::Update',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 3,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status::Update',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 50,
                    },
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status::Other',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 25,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data).toHaveLength(1)
        expect(result.current.data[0]).toEqual({
            intentL1: 'Order',
            intentL2: 'Status',
            handoverInteractions: 15,
            snoozedInteractions: 3,
            successRate: 80,
            costSaved: 600,
        })
    })

    it('should calculate success rate as percentage (0-100)', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 25,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].successRate).toBe(75)
    })

    it('should return null success rate when total interactions is 0', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 5,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].successRate).toBeNull()
    })

    it('should calculate cost saved correctly', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 20,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].costSaved).toBe(800)
    })

    it('should parse intent levels correctly', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Account::Settings::Update',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 10,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].intentL1).toBe('Account')
        expect(result.current.data[0].intentL2).toBe('Settings')
    })

    it('should return null for handover/snoozed when value is 0', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].handoverInteractions).toBeNull()
        expect(result.current.data[0].snoozedInteractions).toBeNull()
    })

    it('should handle string counts correctly', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                            '10',
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: { allData: [] } as any,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                            'Order::Status',
                        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                            '100',
                    },
                ],
            } as any,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.data[0].handoverInteractions).toBe(10)
        expect(result.current.data[0].successRate).toBe(90)
    })

    it('should set all loading states correctly', () => {
        useHandoverInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        useSnoozedInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        useTotalInteractionsPerIntentMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(
            () => useIntentPerformanceMetrics(filters, timezone),
            {},
        )

        expect(result.current.loadingStates).toEqual({
            handoverInteractions: true,
            snoozedInteractions: false,
            successRate: true,
            costSaved: true,
        })
    })
})
