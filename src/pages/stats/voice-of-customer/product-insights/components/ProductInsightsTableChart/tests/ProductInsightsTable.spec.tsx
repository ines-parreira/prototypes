import { render, screen } from '@testing-library/react'

import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import {
    useReturnMentionsPerProductWithEnrichment,
    useTicketCountPerProductWithEnrichment,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import {
    useNegativeSentimentPerProduct,
    usePositiveSentimentPerProduct,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { useSortedProducts } from 'hooks/reporting/voice-of-customer/useSortedProducts'
import { OrderDirection } from 'models/api/types'
import { FilterKey } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import { ProductInsightsCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent'
import { ProductInsightsHeaderCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsHeaderCellContent'
import {
    NO_DATA_HEADING,
    NO_DATA_SUBHEADING,
    ProductInsightsTable,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable'
import {
    columnsOrder,
    productInsightsTableActiveView,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('pages/common/components/Paginations')
const NumberedPaginationMock = assumeMock(NumberedPagination)

jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent',
)
const ProductInsightsCellContentMock = assumeMock(ProductInsightsCellContent)

jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsHeaderCellContent',
)
const ProductInsightsHeaderCellContentMock = assumeMock(
    ProductInsightsHeaderCellContent,
)

jest.mock('hooks/reporting/useProductInsightsTableConfigSetting')
const useProductInsightsTableSettingMock = assumeMock(
    useProductInsightsTableSetting,
)
jest.mock('hooks/reporting/voice-of-customer/useSortedProducts')
const useSortedProductsWithDataMock = assumeMock(useSortedProducts)

jest.mock('hooks/reporting/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductWithEnrichmentMock = assumeMock(
    useTicketCountPerProductWithEnrichment,
)
const useReturnMentionsPerProductWithEnrichmentMock = assumeMock(
    useReturnMentionsPerProductWithEnrichment,
)
jest.mock('hooks/reporting/voice-of-customer/useSentimentPerProduct')
const usePositiveSentimentPerProductMock = assumeMock(
    usePositiveSentimentPerProduct,
)
const useNegativeSentimentPerProductMock = assumeMock(
    useNegativeSentimentPerProduct,
)

const dummyProducts = [
    {
        id: '1',
        name: 'SonicWave Pro Noise-Canceling Headphones SWP-NC500',
        thumbnail_url: '/img/stats/voc-preview/product_01.png',
        intent: 'Can I reactivate a lost gift card',
    },
    {
        id: '2',
        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
        thumbnail_url: '/img/stats/voc-preview/product_02.png',
        intent: 'Need to properly use earbuds wirelessly',
    },
    {
        id: '3',
        name: 'ThunderBass 2.1 Bluetooth Speaker TB21-BS700',
        thumbnail_url: '/img/stats/voc-preview/product_03.png',
        intent: 'Can I send evidence of my damaged items for refunds request',
    },
    {
        id: '4',
        name: 'Aurabeam Studio Microphone ABM-SM900',
        thumbnail_url: '/img/stats/voc-preview/product_04.png',
        intent: 'what is the longevity of the waterproof earbuds',
    },
    {
        id: '5',
        name: 'Resonix Home Theater Soundbar RHT-SB750',
        thumbnail_url: '/img/stats/voc-preview/product_05.png',
        intent: 'Refund Requests due to damage on arrival',
    },
    {
        id: '6',
        name: 'QuickSync Wireless Turntable WSW-TT200',
        thumbnail_url: '/img/stats/voc-preview/product_06.png',
        intent: 'Information about the quicksync wireless turntable',
    },
    {
        id: '7',
        name: 'QuietPod Construction Headphones PX-BCH450',
        thumbnail_url: '/img/stats/voc-preview/product_07.png',
        intent: 'Claim that construction is still being heard in quetpod',
    },
    {
        id: '8',
        name: 'New Jazz Turntable JT-0198FB',
        thumbnail_url: '/img/stats/voc-preview/product_08.png',
        intent: 'Refund is needed for a lot of different construction',
    },
    {
        id: '9',
        name: 'Floating Record player BT-BC9871',
        thumbnail_url: '/img/stats/voc-preview/product_09.png',
        intent: 'Why is the color scratching off of the headphones',
    },
]

describe('ProductInsightsTable', () => {
    const intentCustomFieldId = 123
    const sentimentCustomFieldId = 456

    beforeEach(() => {
        useSortedProductsWithDataMock.mockReturnValue({
            isLoading: false,
            products: dummyProducts,
        })

        useProductInsightsTableSettingMock.mockReturnValue({
            columnsOrder,
            rowsOrder: [],
            currentView: { ...productInsightsTableActiveView, rows: [] },
            submitActiveView: jest.fn(),
        })

        ProductInsightsCellContentMock.mockImplementation(() => <td />)
        ProductInsightsHeaderCellContentMock.mockImplementation(() => <th />)
        NumberedPaginationMock.mockImplementation(() => <div />)
    })

    it('should pass the sorting hook to header cells with respective props', () => {
        const statsFilters = {
            [FilterKey.Period]: {
                start_datetime: '',
                end_datetime: '',
            },
        }
        const userTimezone = 'UTC'
        const order = OrderDirection.Desc

        render(
            <ProductInsightsTable
                intentCustomFieldId={intentCustomFieldId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )
        const calls = ProductInsightsHeaderCellContentMock.mock.calls
        calls.forEach((call) => {
            const hook = call[0].useSortingQuery
            renderHook(() => hook(statsFilters, userTimezone, order))
        })

        expect(useTicketCountPerProductWithEnrichmentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            order,
        )
        expect(usePositiveSentimentPerProductMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            sentimentCustomFieldId,
            order,
        )
        expect(useNegativeSentimentPerProductMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            sentimentCustomFieldId,
            order,
        )
        expect(useTicketCountPerProductWithEnrichmentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            order,
        )
        expect(
            useReturnMentionsPerProductWithEnrichmentMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
            intentCustomFieldId,
            order,
        )
    })

    it('renders loading fallback rows when isLoading is true', () => {
        useSortedProductsWithDataMock.mockReturnValue({
            isLoading: true,
            products: dummyProducts,
        })

        render(
            <ProductInsightsTable
                intentCustomFieldId={intentCustomFieldId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()

        const loadingRows = screen.getAllByRole('row')
        // Subtract 1 for the header row
        expect(loadingRows.length - 1).toBe(10)
    })

    it('shows pagination controls when total items exceed page size', () => {
        useSortedProductsWithDataMock.mockReturnValue({
            isLoading: false,
            products: dummyProducts
                .concat(dummyProducts)
                .map((product, index) => ({
                    ...product,
                    id: `${index + 1}`,
                })),
        })

        render(
            <ProductInsightsTable
                intentCustomFieldId={intentCustomFieldId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(NumberedPaginationMock).toHaveBeenCalled()
    })

    it('does not show pagination controls when total items are less than or equal to page size', () => {
        useSortedProductsWithDataMock.mockReturnValue({
            isLoading: false,
            products: dummyProducts.slice(0, 5),
        })

        render(
            <ProductInsightsTable
                intentCustomFieldId={intentCustomFieldId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(NumberedPaginationMock).not.toHaveBeenCalled()
    })

    it('renders fallback message when there are no products', () => {
        useSortedProductsWithDataMock.mockReturnValue({
            isLoading: false,
            products: [],
        })

        render(
            <ProductInsightsTable
                intentCustomFieldId={intentCustomFieldId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(screen.getByText(NO_DATA_HEADING)).toBeInTheDocument()
        expect(screen.getByText(NO_DATA_SUBHEADING)).toBeInTheDocument()
    })
})
