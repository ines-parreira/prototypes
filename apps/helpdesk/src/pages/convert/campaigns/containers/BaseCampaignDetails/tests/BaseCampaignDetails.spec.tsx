import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { campaign as campaignFixture } from 'fixtures/campaign'
import { entitiesInitialState } from 'fixtures/entities'
import type { RootState, StoreDispatch } from 'state/types'

import { BaseCampaignDetails } from '../BaseCampaignDetails'

const integration = fromJS({
    type: 'gorgias_chat',
    id: '1',
    name: 'Unit Test Chat',
})

const campaign = fromJS(campaignFixture)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const defaultState = {
    entities: entitiesInitialState,
} as RootState
const store = mockStore(defaultState)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

describe('<BaseCampaignDetails />', () => {
    it('matches snapshot', () => {
        const { container } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <BaseCampaignDetails
                        integration={integration}
                        campaign={campaign}
                        isEditMode={true}
                    >
                        <div>content</div>
                    </BaseCampaignDetails>
                </Provider>
            </MemoryRouter>,
        )

        expect(container).toMatchSnapshot()
    })
})
