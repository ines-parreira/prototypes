import {
    useAIIntentCustomFieldsTimeSeries,
    useCustomFieldsForProductTimeSeries,
    useCustomFieldsTimeSeries,
} from 'hooks/reporting/useCustomFieldsTimeSeries'
import {
    AMOUNT_OF_PRODUCTS_TO_SHOW,
    AMOUNT_OF_SELECTED_INTENTS,
    useAIIntentsForProductTimeSeries,
    useAIIntentsTimeSeries,
} from 'hooks/reporting/voice-of-customer/useAIIntentsTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { TicketTimeReference } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { TOP_INTENTS_PER_PAGE } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useCustomFieldsTimeSeries')
const useAIIntentCustomFieldsTimeSeriesMock = assumeMock(
    useAIIntentCustomFieldsTimeSeries,
)
const useCustomFieldsForProductTimeSeriesMock = assumeMock(
    useCustomFieldsForProductTimeSeries,
)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('useAIIntentsTimeSeries', () => {
    const intentCustomFieldId = 123
    const response: ReturnType<typeof useCustomFieldsTimeSeries> = {
        isFetching: false,
        data: [],
        granularity: ReportingGranularity.Hour,
        legendInfo: {
            labels: ['Subcategory'],
            tooltips: ['Category > Subcategory'],
        },
        legendDatasetVisibility: { 0: true },
    }

    useAIIntentCustomFieldsTimeSeriesMock.mockReturnValue(response)
    useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
        intentCustomFieldId: 2,
        outcomeCustomFieldId: 3,
        sentimentCustomFieldId: 4,
    })

    it('should return intents custom field trend', () => {
        const { result } = renderHook(() =>
            useAIIntentsTimeSeries(intentCustomFieldId),
        )

        expect(useAIIntentCustomFieldsTimeSeriesMock).toHaveBeenCalledWith({
            selectedCustomFieldId: intentCustomFieldId,
            ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
            topAmount: TOP_INTENTS_PER_PAGE,
            datasetVisibilityItems: AMOUNT_OF_SELECTED_INTENTS,
        })
        expect(result.current).toEqual(response)
    })
})

describe('useAIIntentsForProductTimeSeries', () => {
    const intentCustomFieldId = 123
    const response: ReturnType<typeof useAIIntentsForProductTimeSeries> = {
        isFetching: false,
        data: [],
        granularity: ReportingGranularity.Hour,
        legendInfo: {
            labels: ['Subcategory'],
            tooltips: ['Category > Subcategory'],
        },
        legendDatasetVisibility: { 0: true },
    }
    const productId = 'some-product-id'

    useCustomFieldsForProductTimeSeriesMock.mockReturnValue(response)
    useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
        intentCustomFieldId: 2,
        outcomeCustomFieldId: 3,
        sentimentCustomFieldId: 4,
    })

    it('should return intents custom field trend', () => {
        const { result } = renderHook(() =>
            useAIIntentsForProductTimeSeries(productId, intentCustomFieldId),
        )

        expect(useCustomFieldsForProductTimeSeriesMock).toHaveBeenCalledWith({
            selectedCustomFieldId: intentCustomFieldId,
            datasetVisibilityItems: AMOUNT_OF_PRODUCTS_TO_SHOW,
            topAmount: AMOUNT_OF_PRODUCTS_TO_SHOW,
            productId,
        })
        expect(result.current).toEqual(response)
    })
})
