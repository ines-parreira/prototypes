import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { TableCellType } from 'pages/stats/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { PerformanceByArticle } from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticle'
import { usePerformanceByArticleMetrics } from 'pages/stats/help-center/hooks/usePerformanceByArticleMetrics'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/stats/help-center/hooks/usePerformanceByArticleMetrics',
    () => ({
        usePerformanceByArticleMetrics: jest.fn(),
    }),
)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)
const mockUsePerformanceByArticleMetrics = jest.mocked(
    usePerformanceByArticleMetrics,
)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const helpCenterId = 1
const helpCenterDomain = 'acme'

const renderComponent = () => {
    render(
        <Provider store={store}>
            <PerformanceByArticle
                helpCenterDomain={helpCenterDomain}
                helpCenterId={helpCenterId}
            />
        </Provider>,
    )
}

describe('<PerformanceByArticle/>', () => {
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
    }

    const timezone = 'US'

    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        // useSelectedHelpCenterMock.mockReturnValue({
        //     activeHelpCenters: [],
        //     helpCenters: [],
        //     isLoading: false,
        //     selectedHelpCenter: {} as any,
        //     setStatsFilters: noop,
        //     sortedHelpCenters: [],
        //     statsFilters,
        //     helpCenterId,
        //     selectedHelpCenterDomain: helpCenterDomain,
        // })
        mockUsePerformanceByArticleMetrics.mockClear()
        mockUsePerformanceByArticleMetrics.mockReturnValue({
            data: [[]],
            isLoading: false,
            total: 0,
        })
    })

    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Performance by articles')).toBeInTheDocument()
    })

    it('should render table with data', () => {
        mockUsePerformanceByArticleMetrics.mockReturnValue({
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'What are AfterPay, Klarna and ShopPay Installments?',
                        link: 'http://acme.gorgias.docker/app/stats/help-center',
                    },
                ],
            ],
            isLoading: false,
            total: 50,
        })

        renderComponent()

        expect(
            screen.getByText(
                'What are AfterPay, Klarna and ShopPay Installments?',
            ),
        ).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'http://acme.gorgias.docker/app/stats/help-center',
        )
    })

    it('should show loader when request is loading', () => {
        mockUsePerformanceByArticleMetrics.mockReturnValue({
            data: [],
            isLoading: true,
            total: 0,
        })

        renderComponent()

        expect(document.querySelector('.loader')).toBeInTheDocument()
    })

    it('should paginate to the next page', () => {
        mockUsePerformanceByArticleMetrics.mockReturnValue({
            data: [
                [
                    {
                        type: TableCellType.String,
                        value: 'What are AfterPay, Klarna and ShopPay Installments?',
                        link: 'http://acme.gorgias.docker/app/stats/help-center',
                    },
                ],
            ],
            isLoading: false,
            total: 50,
        })

        renderComponent()

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'false')

        userEvent.click(screen.getByText('2'))

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'false')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('3')).toHaveAttribute('aria-current', 'false')
    })

    it('should render no data state', () => {
        mockUsePerformanceByArticleMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            total: 50,
        })

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })
})
