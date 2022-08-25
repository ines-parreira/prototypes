import React from 'react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import App, {Tab} from 'pages/integrations/App'
import client from 'models/api/resources'
import {dummyAppData} from 'fixtures/apps'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})
const appId = '1234'
const mockServer = new MockAdapter(client)

describe(`App`, () => {
    beforeEach(() => mockServer.reset())

    it('should render', async () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <App />
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

    it('should render in preview mode', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply((config) => {
            expect(config.params).toEqual({preview: true})
            return [200, dummyAppData]
        })

        const {findAllByText} = renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}?preview=1`,
            }
        )
        await findAllByText(new RegExp(dummyAppData.name))

        expect(mockServer.history.get.length).toEqual(1)
    })

    it('should render the advanced tab', async () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId/:extra?',
                route: `/integrations/app/${appId}/${Tab.Advanced}`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
        mockServer.onGet(`/api/async/errors`).reply(200, {data: []})
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(container.firstChild).toMatchSnapshot()
    })
})
