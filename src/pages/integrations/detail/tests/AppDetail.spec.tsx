import React from 'react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import AppDetail from 'pages/integrations/detail/AppDetail'
import client from 'models/api/resources'
import {dummyAppData} from 'fixtures/apps'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})
const appId = '1234'
const mockServer = new MockAdapter(client)

describe(`AppDetail`, () => {
    it('should render', async () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <AppDetail />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(container.firstChild).toMatchSnapshot()
    })
})
