import { render } from '@repo/testing'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import { getIntegrationConfig } from 'state/integrations/helpers'

import Details from '../Details'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
const httpConfig = getIntegrationConfig(IntegrationType.Http)
describe('Details', () => {
    it('should render', () => {
        const { queryAllByText } = render(<Details />, {
            storeState: store.getState() as object,
        })
        expect(queryAllByText(httpConfig!.title))
    })
})
