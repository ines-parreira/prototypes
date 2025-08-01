import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ArticleViewsTrendCard } from 'domains/reporting/pages/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard'
import HelpCenterOverviewSection from 'domains/reporting/pages/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import { SearchesTrendCard } from 'domains/reporting/pages/help-center/components/SearchesTrendCard/SearchesTrendCard'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'domains/reporting/pages/help-center/hooks/useArticleViewsTrend',
    () => ({
        useArticleViewsTrend: () => ({ data: { value: 1 }, isFetching: false }),
    }),
)
jest.mock(
    'domains/reporting/pages/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard',
)
const ArticleViewsTrendCardMock = assumeMock(ArticleViewsTrendCard)
jest.mock(
    'domains/reporting/pages/help-center/components/SearchesTrendCard/SearchesTrendCard',
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
