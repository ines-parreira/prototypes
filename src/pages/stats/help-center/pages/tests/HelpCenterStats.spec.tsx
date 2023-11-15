import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {UseQueryResult} from '@tanstack/react-query'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import configureStore from 'store/configureStore.prod'
import HelpCenterStats from '../HelpCenterStats'
import {useArticleViewTimeSeries} from '../../hooks/useArticleViewTimeSeries'
import {InitialRootState} from '../../../../../types'

jest.mock('../../hooks/useHelpCenterTrend', () => ({
    useHelpCenterTrend: () => ({data: {value: 1}, isFetching: false}),
}))
jest.mock('../../hooks/useArticleViewTimeSeries', () => ({
    useArticleViewTimeSeries: jest.fn(),
}))
jest.mock('../../hooks/useSearchTermsMetrics', () => ({
    useSearchTermsMetrics: () => ({data: [], isFetching: false}),
}))

jest.mock('../../hooks/usePerformanceByArticleMetrics', () => ({
    usePerformanceByArticleMetrics: () => ({data: [], isFetching: false}),
}))
jest.mock('../../hooks/useNoSearchResultsMetrics', () => ({
    useNoSearchResultsMetrics: () => ({data: [], isFetching: false}),
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: jest.fn(),
}))
jest.mock('../../hooks/useSearchResultRange', () => ({
    useSearchResultRange: () => ({data: [], isLoading: true}),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const mockUseHelpCenterList = jest.mocked(useHelpCenterList)
const mockUseArticleViewTimeSeries = jest.mocked(useArticleViewTimeSeries)

const helpCenters = getHelpCentersResponseFixture.data

const renderComponent = () => {
    const store = configureStore({} as InitialRootState)
    render(
        <Provider store={store}>
            <HelpCenterStats />
        </Provider>
    )
}

describe('<HelpCenterStats />', () => {
    beforeEach(() => {
        const mockedDate = new Date(1999, 10, 1)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters,
            hasMore: false,
            fetchMore: jest.fn(),
        })
        mockUseArticleViewTimeSeries.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)
    })

    it('should render page with title and sections', () => {
        renderComponent()

        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Help Center searches')).toBeInTheDocument()
        expect(
            screen.getByText('Analytics are using UTC timezone')
        ).toBeInTheDocument()
    })

    it('should hide tips', () => {
        renderComponent()

        expect(screen.getByTestId('article-tip')).toBeInTheDocument()
        expect(screen.getByTestId('searches-tip')).toBeInTheDocument()

        userEvent.click(screen.getByText('Hide tips'))

        expect(screen.queryByTestId('article-tip')).not.toBeInTheDocument()
        expect(screen.queryByTestId('searches-tip')).not.toBeInTheDocument()
    })

    it('should show loading state', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: true,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId('help-center-stats-loader')
        ).toBeInTheDocument()
    })

    it('should show empty state', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {
                    ...getHelpCentersResponseFixture.data[0],
                    deactivated_datetime: '2021-01-01T00:00:00Z',
                },
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId('help-center-stats-empty-state')
        ).toBeInTheDocument()
    })

    it('should change help center when filter changed', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(mockUseArticleViewTimeSeries).toHaveBeenCalledWith(
            expect.objectContaining({
                helpCenters: [helpCenters[0].id],
            }),
            expect.anything(),
            expect.anything()
        )

        userEvent.click(screen.getByText(helpCenters[0].name))
        userEvent.click(screen.getByText(helpCenters[1].name))

        expect(mockUseArticleViewTimeSeries).toHaveBeenLastCalledWith(
            expect.objectContaining({
                helpCenters: [helpCenters[1].id],
            }),
            expect.anything(),
            expect.anything()
        )
    })
})
