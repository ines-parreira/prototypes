import React from 'react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LD from 'launchdarkly-react-client-sdk'

import {render} from '@testing-library/react'

import {FeatureFlagKey} from 'config/featureFlags'

import {RootState, StoreDispatch} from 'state/types'

import {ChatCampaignDetailsFactory} from '../ChatCampaignDetailsFactory'

const integration = fromJS({
    id: 1,
})

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('<ChatCampaignDetailsFactory />', () => {
    const defaultState = {} as RootState

    describe('Merchant is an alpha tester', () => {
        beforeAll(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.RevenueAlphaTesters]: true,
            }))
        })

        it('renders the "AdvancedCampaignDetails" component', () => {
            const {getByTestId} = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatCampaignDetailsFactory
                        integration={integration}
                        id="1"
                    />
                </Provider>
            )

            getByTestId('advanced-campaign-details-page')
        })
    })

    describe('Merchant is not an alpha tester', () => {
        beforeAll(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.RevenueAlphaTesters]: false,
            }))
        })
        it('renders the "GorgiasChatCampaignDetailForm" component', () => {
            const {getByTestId} = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatCampaignDetailsFactory
                        integration={integration}
                        id="1"
                    />
                </Provider>
            )

            getByTestId('common-campaign-details-page')
        })
    })
})
