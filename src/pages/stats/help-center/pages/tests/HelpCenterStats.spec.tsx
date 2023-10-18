import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import userEvent from '@testing-library/user-event'
import HelpCenterStats from '../HelpCenterStats'
import {RootState} from '../../../../../state/types'
import {account} from '../../../../../fixtures/account'

const defaultState = {
    currentAccount: fromJS(account),
} as RootState

jest.mock('../../hooks/useHelpCenterTrend', () => ({
    useHelpCenterTrend: () => ({data: 0, isFetching: false}),
}))
jest.mock('../../hooks/useArticleViewTimeSeries', () => ({
    useArticleViewTimeSeries: () => ({data: undefined, isFetching: false}),
}))

const mockStore = configureMockStore([thunk])

const renderComponent = () => {
    render(
        <Provider store={mockStore(defaultState)}>
            <HelpCenterStats />
        </Provider>
    )
}

describe('<HelpCenterStats />', () => {
    beforeEach(() => {
        const mockedDate = new Date(1999, 10, 1)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
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
})
