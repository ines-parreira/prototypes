import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TableCellType } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { PerformanceByArticle } from 'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticle'
import { usePerformanceByArticleMetrics } from 'domains/reporting/pages/help-center/hooks/usePerformanceByArticleMetrics'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock(
    'domains/reporting/pages/help-center/hooks/usePerformanceByArticleMetrics',
    () => ({
        usePerformanceByArticleMetrics: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
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
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
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
