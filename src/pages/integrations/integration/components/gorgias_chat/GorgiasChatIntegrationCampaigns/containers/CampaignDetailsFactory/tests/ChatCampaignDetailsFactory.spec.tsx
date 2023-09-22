import React from 'react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import {entitiesInitialState} from 'fixtures/entities'
import {integrationsState} from 'fixtures/integrations'
import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'

import {ChatCampaignDetailsFactory} from '../ChatCampaignDetailsFactory'

const integration = fromJS({
    id: 1,
})

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('../../../utils/canSeeCampaignImprovements', () => {
    return {
        canSeeCampaignImprovements: jest.fn(() => false),
    }
})

describe('<ChatCampaignDetailsFactory />', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
    } as RootState

    it('renders the "AdvancedCampaignDetails" component if merchant is not a revenue subscriber', () => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        const {getByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <ChatCampaignDetailsFactory integration={integration} id="1" />
            </Provider>
        )

        getByTestId('advanced-campaign-details-page')
    })

    it('renders the "AdvancedCampaignDetails" component if merchant is a revenue subscriber', () => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)

        const {getByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <ChatCampaignDetailsFactory integration={integration} id="1" />
            </Provider>
        )

        getByTestId('advanced-campaign-details-page')
    })
})
