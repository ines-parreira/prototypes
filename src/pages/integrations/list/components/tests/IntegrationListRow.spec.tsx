import {render} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import IntegrationListRow from '../IntegrationListRow'
import {IntegrationType} from '../../../../../models/integration/constants'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('IntegrationListRow', () => {
    it('should display the integration row as a link', () => {
        const integration = {
            type: IntegrationType.Http,
            title: 'an integration',
            description: 'this is a cool integration',
            count: 1,
        }

        const {container} = render(
            <Provider store={store}>
                <IntegrationListRow integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an external integration', () => {
        const integration = {
            type: IntegrationType.App,
            title: 'an integration',
            description: 'this is a cool integration',
            appId: '420',
            count: 0,
        }

        const {container} = render(
            <Provider store={store}>
                <IntegrationListRow integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an integration with upgrade requirement', () => {
        const integration = {
            type: IntegrationType.Twitter,
            title: 'an integration',
            description: 'this is a cool integration',
            requiredPlanName: 'Basic',
            count: 0,
        }

        const {container} = render(
            <Provider store={store}>
                <IntegrationListRow integration={integration} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
