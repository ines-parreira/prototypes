import React from 'react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import {entitiesInitialState} from 'fixtures/entities'
import {integrationsState} from 'fixtures/integrations'
import * as revenueBetaHook from 'pages/common/hooks/useIsRevenueBetaTester'

import {ChatCampaignDetailsFactory} from '../ChatCampaignDetailsFactory'

const integration = fromJS({
    id: 1,
})

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock('pages/common/forms/RichField/RichFieldEditor')

describe('<ChatCampaignDetailsFactory />', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
    } as RootState

    describe('Merchant is an alpha tester', () => {
        beforeAll(() => {
            jest.spyOn(
                revenueBetaHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => true)
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
            jest.spyOn(
                revenueBetaHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => false)
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
})
