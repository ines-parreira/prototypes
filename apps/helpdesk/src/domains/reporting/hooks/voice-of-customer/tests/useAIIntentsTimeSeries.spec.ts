import { assumeMock, renderHook } from '@repo/testing'

import type { useCustomFieldsTimeSeries } from 'domains/reporting/hooks/useCustomFieldsTimeSeries'
import {
    useAIIntentCustomFieldsTimeSeries,
    useCustomFieldsForProductTimeSeries,
} from 'domains/reporting/hooks/useCustomFieldsTimeSeries'
import {
    AMOUNT_OF_PRODUCTS_TO_SHOW,
    AMOUNT_OF_SELECTED_INTENTS,
    useAIIntentsForProductTimeSeries,
    useAIIntentsTimeSeries,
} from 'domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TOP_INTENTS_PER_PAGE } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('domains/reporting/hooks/useCustomFieldsTimeSeries')
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
        isLoading: false,
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
        isLoading: false,
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
