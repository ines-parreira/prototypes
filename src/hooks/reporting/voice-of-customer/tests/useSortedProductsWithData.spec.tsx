import { Provider } from 'react-redux'

import { MergedRecordWithEnrichment } from 'hooks/reporting/useMetricPerDimension'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    useTicketCountPerProductWithEnrichment,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { useSortedProductsWithData } from 'hooks/reporting/voice-of-customer/useSortedProductsWithData'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { PRODUCT_ID_DIMENSION } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { EnrichmentFields } from 'models/reporting/types'
import { FilterKey, StatsFilters } from 'models/stat/types'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'state/ui/stats/constants'
import { initialState } from 'state/ui/stats/productInsightsSlice'
import { PRODUCT_NAME_FIELD } from 'state/ui/stats/productsPerTicketSlice'
import { assetsUrl } from 'utils'
import { assumeMock, mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductWithEnrichmentMock = assumeMock(
    useTicketCountPerProductWithEnrichment,
)

describe('useSortedProductsWithData', () => {
    const statsFilters: StatsFilters = {
        [FilterKey.Period]: {
            start_datetime: '',
            end_datetime: '',
        },
    }
    const defaultState = {
        stats: {
            filters: statsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: statsFilters,
                },
                statsTables: {
                    [PRODUCT_INSIGHTS_SLICE_NAME]: initialState,
                },
            },
        },
    }
    const productId = 123
    const anotherProductId = 456
    const exampleData = [
        {
            [TicketProductsEnrichedMeasure.TicketCount]: String(50),
            [PRODUCT_ID_DIMENSION]: String(productId),
            [TicketProductsEnrichedDimension.StoreId]: String(33),
            [PRODUCT_ENRICHMENT_ENTITY_ID]: productId,
            [PRODUCT_NAME_FIELD]: 'Some name',
            [EnrichmentFields.ProductThumbnailUrl]: assetsUrl(
                '/img/stats/voc-preview/product_01.png',
            ),
        },
        {
            [TicketProductsEnrichedMeasure.TicketCount]: String(30),
            [PRODUCT_ID_DIMENSION]: String(anotherProductId),
            [TicketProductsEnrichedDimension.StoreId]: String(24),
            [PRODUCT_ENRICHMENT_ENTITY_ID]: anotherProductId,
            [PRODUCT_NAME_FIELD]: 'Some other name',
            [EnrichmentFields.ProductThumbnailUrl]: assetsUrl(
                '/img/stats/voc-preview/product_02.png',
            ),
        },
    ] as MergedRecordWithEnrichment[]

    beforeEach(() => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: {
                value: null,
                allData: exampleData,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('returns products array', () => {
        const { result } = renderHook(() => useSortedProductsWithData(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(Array.isArray(result.current.products)).toBeTruthy()
    })

    it('returns isLoading', () => {
        const isFetching = true
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: null,
            isFetching,
            isError: false,
        })

        const { result } = renderHook(() => useSortedProductsWithData(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.isLoading).toBe(isFetching)
    })
})
