import React from 'react'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import Details from '../Details'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const httpConfig = getIntegrationConfig(IntegrationType.Http)

describe('Details', () => {
    it('should render', () => {
        const {queryAllByText} = render(
            <Provider store={store}>
                <Details />
            </Provider>
        )

        expect(queryAllByText(httpConfig!.title))
    })
})
