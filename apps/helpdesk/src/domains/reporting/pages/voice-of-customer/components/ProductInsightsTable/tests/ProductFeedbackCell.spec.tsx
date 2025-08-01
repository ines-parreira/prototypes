import { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTopIntentPerProduct } from 'domains/reporting/hooks/voice-of-customer/useTopIntentPerProduct'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { ProductFeedbackCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductFeedbackCell'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/voice-of-customer/useTopIntentPerProduct')
const useTopIntentPerProductMock = assumeMock(useTopIntentPerProduct)

jest.mock('@gorgias/merchant-ui-kit')
const SkeletonMock = assumeMock(Skeleton)

const renderWithTable = (ui: ReactNode) => {
    return render(
        <table>
            <tbody>
                <tr>{ui}</tr>
            </tbody>
        </table>,
    )
}

describe('ProductFeedbackCell', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://example.com/image.png',
    }
    const intentCustomFieldId = 123
    const feedback = 'Feedback'
    const intent = ['Product', 'Test', feedback].join(
        TICKET_CUSTOM_FIELDS_API_SEPARATOR,
    )

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
        renderWithTable(
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

        expect(screen.getByRole('cell').textContent).toEqual(feedback)
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

        renderWithTable(
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

        renderWithTable(
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

        renderWithTable(
            <ProductFeedbackCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(screen.getByRole('cell').textContent).toEqual('')
    })
})
