import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ArticleViewsTrendCard } from 'pages/stats/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard'
import HelpCenterOverviewSection from 'pages/stats/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import { SearchesTrendCard } from 'pages/stats/help-center/components/SearchesTrendCard/SearchesTrendCard'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('pages/stats/help-center/hooks/useArticleViewsTrend', () => ({
    useArticleViewsTrend: () => ({ data: { value: 1 }, isFetching: false }),
}))
jest.mock(
    'pages/stats/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard',
)
const ArticleViewsTrendCardMock = assumeMock(ArticleViewsTrendCard)
jest.mock(
    'pages/stats/help-center/components/SearchesTrendCard/SearchesTrendCard',
)
const SearchesTrendCardMock = assumeMock(SearchesTrendCard)

const mockStore = configureMockStore([thunk])
const store = mockStore()

const renderComponent = () => {
    render(
        <Provider store={store}>
            <HelpCenterOverviewSection />
        </Provider>,
    )
}

describe('<HelpCenterOverviewSection />', () => {
    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)

        ArticleViewsTrendCardMock.mockImplementation(() => <div />)
        SearchesTrendCardMock.mockImplementation(() => <div />)
    })
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(ArticleViewsTrendCardMock).toHaveBeenCalled()
        expect(SearchesTrendCardMock).toHaveBeenCalled()
    })

    // FIXME: remove the `skip` as soon as the documentation article links are ready
    it.skip('should hide tips', () => {
        renderComponent()

        expect(screen.getByTestId('article-tip')).toBeInTheDocument()
        expect(screen.getByTestId('searches-tip')).toBeInTheDocument()

        userEvent.click(screen.getByText('Hide tips'))

        expect(screen.queryByTestId('article-tip')).not.toBeInTheDocument()
        expect(screen.queryByTestId('searches-tip')).not.toBeInTheDocument()
    })
})
