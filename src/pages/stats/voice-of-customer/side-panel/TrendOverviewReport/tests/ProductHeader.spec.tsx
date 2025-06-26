import { render, screen } from '@testing-library/react'
import moment from 'moment-timezone'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { ReportingGranularity } from 'models/reporting/types'
import { ProductHeader } from 'pages/stats/voice-of-customer/components/ProductHeader'
import { SidePanelProduct } from 'state/ui/stats/sidePanelSlice'
import { SHORT_DATE_WITH_YEAR_US, SHORT_DATE_WITH_YEAR_WORLD } from 'utils/date'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/reporting/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductMock = assumeMock(useTicketCountPerProduct)
let languageGetter: jest.SpyInstance

describe('ProductHeader', () => {
    const product: SidePanelProduct = {
        id: 'some-id',
        name: 'some-name',
    }
    const startDate = '2024-09-14T00:00:00+00:00'
    const userTimezone = 'UTC'

    beforeEach(() => {
        languageGetter = jest.spyOn(window.navigator, 'language', 'get')
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: startDate,
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            granularity: ReportingGranularity.Day,
            userTimezone,
        })
        useTicketCountPerProductMock.mockReturnValue({
            data: {
                value: 34,
                decile: 4,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should render product name', () => {
        render(<ProductHeader product={product} />)

        expect(screen.getByText(product.name)).toBeInTheDocument()
    })

    it.each([
        { languageCode: 'en-US', format: SHORT_DATE_WITH_YEAR_US },
        {
            languageCode: 'fr',
            format: SHORT_DATE_WITH_YEAR_WORLD,
        },
    ])(
        'should render dates with a geo specific formatting ($languageCode)',
        ({ languageCode, format }) => {
            languageGetter.mockReturnValue(languageCode)

            render(<ProductHeader product={product} />)

            expect(
                screen.getByText(
                    moment.tz(startDate, userTimezone).format(format),
                    { exact: false },
                ),
            ).toBeInTheDocument()
        },
    )
})
