import React from 'react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import {notify} from 'state/notifications/actions'
import App, {Tab} from 'pages/integrations/integration/components/app/App'
import client from 'models/api/resources'
import {dummyAppData} from 'fixtures/apps'
import {TrialPeriod} from 'models/integration/types/app'
import {Integration} from 'models/integration/types'
import {RootState} from 'state/types'

import {DEFAULT_VALUES} from 'pages/integrations/mappers/mapDefaults'
import {Application, getApplicationById} from 'services/applications'
import {applications as mockApplications} from 'fixtures/applications'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    currentAccount: fromJS({domain: '20-1 rpz'}),
    integrations: fromJS({integrations: []}),
})
const appId = '1234'
const mockServer = new MockAdapter(client)

jest.mock('services/applications', () => ({
    getApplicationById: jest.fn(),
}))
jest.mock('state/notifications/actions', () => {
    const actions: {notify: unknown} = jest.requireActual(
        'state/notifications/actions'
    )
    return {
        ...actions,
        notify: jest.fn(() => () => undefined),
    }
})

jest.mock('models/integration/resources', () => {
    const resources: {disconnectApp: unknown} = jest.requireActual(
        'models/integration/resources'
    )
    return {
        ...resources,
        disconnectApp: jest.fn((appId: 'success' | 'failure') =>
            Promise.resolve(appId === 'success' ? true : false)
        ),
    }
})

describe(`App`, () => {
    beforeEach(() => {
        mockServer.reset()
    })

    it('should render', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)

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

        expect(mockServer.history.get.length).toEqual(2)
    })

    it('should render the advanced tab', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
        mockServer.onGet(`/api/async/errors`).reply(200, {data: []})

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
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the connections tab when there are connected integrations', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, is_installed: true})
        mockServer.onGet(`/api/async/errors`).reply(200, {data: []})

        const store = mockStore({
            integrations: fromJS({
                currentAccount: fromJS({domain: '20-1 rpz'}),
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: '1234',
                        name: 'my app',
                        meta: {address: '@myapp'},
                    } as Integration,
                ],
            }),
        } as unknown as RootState)

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId/:extra?',
                route: `/integrations/app/${appId}/${Tab.Connections}`,
            }
        )

        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(getByText('App Details')).toBeDefined()
        expect(getByText('Advanced')).toBeDefined()
        expect(getByText('Connections')).toBeDefined()
    })

    it('should render the connections tab with the button add connection for apps that support multiple connections', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, is_installed: true})
        mockServer.onGet(`/api/async/errors`).reply(200, {data: []})

        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.id = appId
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const store = mockStore({
            integrations: fromJS({
                currentAccount: fromJS({domain: '20-1 rpz'}),
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: '1234',
                        name: 'my app',
                        meta: {address: '@myapp'},
                    } as Integration,
                ],
            }),
        } as unknown as RootState)

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId/:extra?',
                route: `/integrations/app/${appId}/${Tab.Connections}`,
            }
        )

        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(getByText('Add Account')).toBeDefined()
    })

    it('should not render the connections tab with no integrations', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, is_installed: true})
        mockServer.onGet(`/api/async/errors`).reply(200, {data: []})

        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId/:extra?',
                route: `/integrations/app/${appId}/${Tab.Advanced}`,
            }
        )

        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(queryByText('App Details')).not.toBeNull()
        expect(queryByText('Advanced')).not.toBeNull()
        expect(queryByText('Connections')).toBeNull()
    })

    it('should have a functionnal disconnect flow', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, id: 'success', is_installed: true})
        renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findAllByText(new RegExp(dummyAppData.name))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect App'}))
        await waitFor(() => screen.getByRole('button', {name: 'Disconnect'}))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect'}))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', {name: 'Connect App'})
            ).toBeTruthy()
        })
        expect((notify as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('should have a failed disconnection flow', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, id: 'failure', is_installed: true})
        renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findAllByText(new RegExp(dummyAppData.name))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect App'}))
        await waitFor(() => screen.getByRole('button', {name: 'Disconnect'}))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect'}))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', {name: 'Connect App'})
            ).toBeFalsy()
        })
        expect((notify as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('should display a warning with the right text', async () => {
        mockServer
            .onGet(`/api/apps/${appId}`)
            .reply(200, {...dummyAppData, is_unapproved: true})
        renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText(/has not been approved/))
    })

    it('should display specific tags', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            has_free_trial: true,
            free_trial_period: TrialPeriod.FOURTEEN,
        })
        renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findAllByText(new RegExp(dummyAppData.name))
        expect(screen.getByText('14 DAYS FREE TRIAL'))
    })
    it('should display defaults if config is unapproved and missing fields', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            is_unapproved: true,
            name: null,
        })
        renderWithRouter(
            <Provider store={store}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findByText(new RegExp(DEFAULT_VALUES.title))
    })
    it('disables the disconnect button and shows tooltip when app has connections and supports multiple connections', async () => {
        mockServer.onGet(`/api/apps/${appId}`).reply(200, {
            ...dummyAppData,
            is_installed: true,
            supports_multiple_connections: true,
            id: appId,
        })

        jest.mock('services/applications', () => ({
            getApplicationById: jest.fn(),
        }))
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        mockedGetApplicationById.mockReturnValue({
            ...mockApplications[0],
            supports_multiple_connections: true,
            id: appId,
        })
        const integrationsStore = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'app',
                        application_id: appId,
                        name: 'my app',
                        meta: {address: '@myapp'},
                    } as Integration,
                ],
            }),
        } as unknown as RootState)
        const {getByRole} = renderWithRouter(
            <Provider store={integrationsStore}>
                <App />
            </Provider>,
            {
                path: '/integrations/app/:appId',
                route: `/integrations/app/${appId}`,
            }
        )
        await screen.findAllByText(new RegExp(dummyAppData.name))
        const disconnectButton = getByRole('button', {name: 'Disconnect App'})
        expect(disconnectButton).toHaveClass('isDisabled')
    })
})
