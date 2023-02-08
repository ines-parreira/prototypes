import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import client from 'models/api/resources'
import AlloyConnectButton from 'pages/integrations/components/Detail/AlloyConnectButton'
import * as actions from 'state/integrations/actions'

jest.spyOn(actions, 'deleteIntegration')
jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
const deleteIntegration = actions.deleteIntegration as jest.Mock
const updateOrCreateIntegrationRequest =
    actions.updateOrCreateIntegrationRequest as jest.Mock

const mockStore = configureMockStore([thunk])
const mockedServer = new MockAdapter(client)

describe('AlloyConnectButton', () => {
    afterEach(() => {
        deleteIntegration.mockClear()
        updateOrCreateIntegrationRequest.mockClear()
        mockedServer.reset()
    })

    it('should render a connect button that installs on click', async () => {
        // The first call should show the app is not installed, while the second should show it's installed
        mockedServer
            .onGet('/integrations/alloy/test/init')
            .replyOnce(200, {
                userId: 'user-id',
                userToken: 'user-token',
                isInstalled: false,
            })
            .onGet('/integrations/alloy/test/init')
            .replyOnce(200, {
                userId: 'user-id',
                userToken: 'user-token',
                isInstalled: true,
            })

        window.Alloy = {
            setToken: jest.fn(),
            install: jest
                .fn()
                .mockImplementation(({callback}: {callback: () => void}) => {
                    callback()
                }),
        }

        // Render the button with no installed integration
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })
        const {findByText} = render(
            <Provider store={store}>
                <AlloyConnectButton
                    integrationId="test"
                    appId="test"
                    name="Test"
                />
            </Provider>
        )

        // Click the install button
        const button = await findByText(/Connect App/)
        fireEvent.click(button)

        // The Alloy front-end SDK should have been called and the integration created
        await waitFor(
            () => updateOrCreateIntegrationRequest.mock.calls.length > 0
        )
        expect(window.Alloy.setToken).toHaveBeenCalledWith('user-token')
        expect(window.Alloy.install).toHaveBeenCalled()
        expect(updateOrCreateIntegrationRequest).toHaveBeenCalledWith(
            fromJS({
                name: 'Test',
                type: 'alloy',
                meta: {
                    app_id: 'test',
                    integration_id: 'test',
                },
            }),
            undefined,
            null,
            true
        )
    })

    it('should render a disconnect button that uninstalls on click', async () => {
        const alloyIntegration = {
            id: 2,
            type: 'alloy',
            name: 'Test Alloy integration',
            meta: {
                integration_id: 'test',
            },
        }
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'http',
                        name: 'Test HTTP integration',
                    },
                    alloyIntegration,
                ],
            }),
        })

        const {findByText} = render(
            <Provider store={store}>
                <AlloyConnectButton
                    integrationId="test"
                    appId="test"
                    name="Test"
                />
            </Provider>
        )

        const button = await findByText(/Disconnect App/)
        fireEvent.click(button)

        expect(deleteIntegration).toHaveBeenCalledWith(fromJS(alloyIntegration))
    })
})
