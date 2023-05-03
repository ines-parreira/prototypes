import React from 'react'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'
import thunk from 'redux-thunk'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {FeatureFlagKey} from 'config/featureFlags'
import {RootState, StoreDispatch} from 'state/types'

import StatsNavbarView from '../StatsNavbarView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('StatsNavbarView', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = render(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the new badge when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsBetaTesters]: true,
        }))
        render(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>
        )
        expect(screen.getByText('new')).toBeInTheDocument()
    })

    it('should render the link to busiest times of days when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsBetaTesters]: true,
        }))
        render(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>
        )

        expect(screen.getByText('Busiest times of days')).toBeInTheDocument()
    })

    it('should render the link to the Revenue Campaign when having access to the beta', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueBetaTesters]: true,
            [FeatureFlagKey.RevenueAttributionModel]: true,
            [FeatureFlagKey.RevenueAttributionModelHideDashboard]: false,
        }))
        render(
            <Provider store={mockStore(defaultState)}>
                <StatsNavbarView />
            </Provider>
        )

        expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })
})
