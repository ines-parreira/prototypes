import React from 'react'

import { act, fireEvent, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { MOBILE_CHANNEL_COLUMN_WIDTH } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { ProductInsightsHeaderCellContent } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsHeaderCellContent'
import { ProductInsightsTable } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTable'
import { assumeMock, renderWithStore, triggerWidthResize } from 'utils/testing'

jest.mock(
    'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsHeaderCellContent',
)
const ProductInsightsHeaderCellContentMock = assumeMock(
    ProductInsightsHeaderCellContent,
)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('ProductInsightsTable', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        ProductInsightsHeaderCellContentMock.mockImplementation(() => <td />)
    })

    it('should handle table scrolling', async () => {
        renderWithStore(<ProductInsightsTable />, {})

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(ProductInsightsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    className: expect.stringMatching('withShadow'),
                }),
                {},
            )
        })
    })

    it('should handle table scrolling to the left border', async () => {
        renderWithStore(<ProductInsightsTable />, {})
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
        })

        await waitFor(() => {
            expect(ProductInsightsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    className: expect.not.stringMatching('withShadow'),
                }),
                {},
            )
        })
    })

    it('should render Channels metrics on mobile', () => {
        triggerWidthResize(500)
        renderWithStore(<ProductInsightsTable />, {})

        expect(ProductInsightsHeaderCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                width: MOBILE_CHANNEL_COLUMN_WIDTH,
            }),
            {},
        )
    })
})
