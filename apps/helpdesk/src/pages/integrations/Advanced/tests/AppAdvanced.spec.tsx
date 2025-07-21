import React from 'react'

import { render } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { dummyErrorLogList } from 'fixtures/appErrors'
import { dummyAppDetail } from 'fixtures/apps'
import AppAdvanced from 'pages/integrations/Advanced/AppAdvanced'

import client from '../../../../models/api/resources'

const mockStore = configureMockStore([thunk])
const store = mockStore({ currentAccount: fromJS({ domain: '20-1 rpz' }) })

describe(`AppAdvanced`, () => {
    const mockServer = new MockAdapter(client)

    beforeEach(() => {
        mockServer.reset()
    })

    it('should render', async () => {
        mockServer
            .onGet(`/api/async/errors`)
            .reply(200, { data: dummyErrorLogList })

        const { container, findByText } = render(
            <Provider store={store}>
                <AppAdvanced
                    {...dummyAppDetail}
                    grantedScopes={[
                        'write:all',
                        'users:read',
                        'users:write',
                        'account:read',
                    ]}
                />
            </Provider>,
        )
        await findByText('Error Logs')

        expect(container).toMatchSnapshot()
    })

    it('should render an empty list', async () => {
        mockServer.onGet(`/api/async/errors`).reply(200, { data: [] })

        const { container, findByText } = render(
            <Provider store={store}>
                <AppAdvanced {...dummyAppDetail} />
            </Provider>,
        )
        await findByText('Error Logs')

        expect(container).toMatchSnapshot()
    })
})
