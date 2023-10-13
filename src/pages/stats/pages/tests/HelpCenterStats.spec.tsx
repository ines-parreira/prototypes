import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {HelpCenterStats} from '../HelpCenterStats'
import {RootState} from '../../../../state/types'
import {account} from '../../../../fixtures/account'

const defaultState = {
    currentAccount: fromJS(account),
} as RootState

const mockStore = configureMockStore([thunk])

const renderComponent = () => {
    render(
        <Provider store={mockStore(defaultState)}>
            <HelpCenterStats />
        </Provider>
    )
}

describe('<HelpCenterStats />', () => {
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
})
