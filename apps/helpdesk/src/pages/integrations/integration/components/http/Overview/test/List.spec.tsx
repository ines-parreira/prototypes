import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationBase } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'

import { List } from '../List'

const integrationsState = {
    integrations: [
        { ...integrationBase, type: IntegrationType.Http },
        { ...integrationBase, type: IntegrationType.Http, id: 2 },
        { ...integrationBase, type: IntegrationType.Shopify, id: 3 },
        {
            ...integrationBase,
            type: IntegrationType.Http,
            id: 4,
            managed: true,
        },
    ],
    state: {
        loading: {},
    },
}
const mockStore = configureMockStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })
jest.mock('pages/common/components/Loader/Loader', () => ({
    Loader: () => <div>Loader</div>,
}))
describe('List', () => {
    it('should render a loader', () => {
        const { queryByText } = render(<List />, {
            storeState: mockStore({
                integrations: fromJS({
                    ...integrationsState,
                    state: { loading: { integrations: true } },
                }),
            }).getState() as object,
        })
        expect(queryByText('Loader'))
    })
    it('should render the list of HTTP integrations', () => {
        const { queryAllByText } = render(<List />, {
            storeState: store.getState() as object,
        })
        expect(queryAllByText(integrationBase.name)).toHaveLength(2)
    })
    it('should render a button to add a new integration', () => {
        const { queryByText } = render(<List />, {
            storeState: store.getState() as object,
        })
        expect(queryByText('Add HTTP integration'))
    })
})
