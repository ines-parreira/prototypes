import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import {BaseCampaignDetails} from '../BaseCampaignDetails'

const integration = fromJS({
    type: 'gorgias_chat',
    id: '1',
    name: 'Unit Test Chat',
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const defaultState = {
    entities: entitiesInitialState,
} as RootState
const store = mockStore(defaultState)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    }
)

describe('<BaseCampaignDetails />', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <Provider store={store}>
                <BaseCampaignDetails integration={integration}>
                    <div>content</div>
                </BaseCampaignDetails>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
