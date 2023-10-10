import React from 'react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import {notify} from 'state/notifications/actions'
import App, {Tab} from 'pages/integrations/App'
import client from 'models/api/resources'
import {dummyAppData} from 'fixtures/apps'
import {TrialPeriod} from 'models/integration/types/app'

import {DEFAULT_VALUES} from '../mappers/mapDefaults'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})
const appId = '1234'
const mockServer = new MockAdapter(client)

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

describe(`App`, () => {
    beforeEach(() => {
        mockServer.reset()
    })

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
})
