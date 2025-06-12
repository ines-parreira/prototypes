import { render, screen } from '@testing-library/react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTopIntentPerProduct } from 'hooks/reporting/voice-of-customer/useTopIntentPerProduct'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { formatCategory } from 'pages/stats/ticket-insights/components/DistributionCategoryCell'
import { ProductFeedbackCell } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductFeedbackCell'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/reporting/voice-of-customer/useTopIntentPerProduct')
const useTopIntentPerProductMock = assumeMock(useTopIntentPerProduct)

jest.mock('@gorgias/merchant-ui-kit')
const SkeletonMock = assumeMock(Skeleton)

describe('ProductFeedbackCell', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://example.com/image.png',
    }
    const intentCustomFieldId = 123
    const intent = `Test${TICKET_CUSTOM_FIELDS_API_SEPARATOR}Intent`

    beforeEach(() => {
        jest.clearAllMocks()

        SkeletonMock.mockImplementation(() => <div />)

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00+01:00',
                    end_datetime: '2024-01-01T23:59:59+01:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useTopIntentPerProductMock.mockReturnValue({
            data: {
                value: intent,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
    })

    it('renders the component with intent data', () => {
        render(
            <ProductFeedbackCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(useTopIntentPerProductMock).toHaveBeenCalledWith(
            expect.any(Object),
            'UTC',
            String(intentCustomFieldId),
            product.id,
        )

        expect(screen.getByRole('cell').textContent).toEqual(
            formatCategory(intent),
        )
    })

    it('shows loading state when data is being fetched', () => {
        useTopIntentPerProductMock.mockReturnValue({
            data: {
                value: null,
                allData: [],
            },
            isFetching: true,
            isError: false,
        })

        render(
            <ProductFeedbackCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(SkeletonMock).toHaveBeenCalled()
    })

    it('handles null intent value', () => {
        useTopIntentPerProductMock.mockReturnValue({
            data: {
                value: null,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        render(
            <ProductFeedbackCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(screen.getByRole('cell').textContent).toEqual('')
    })

    it('handles empty intent value', () => {
        useTopIntentPerProductMock.mockReturnValue({
            data: {
                value: '',
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        render(
            <ProductFeedbackCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(screen.getByRole('cell').textContent).toEqual('')
    })
})
