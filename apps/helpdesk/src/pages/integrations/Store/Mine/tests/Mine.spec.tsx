import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { dummyAppListData as appData } from 'fixtures/apps'
import client from 'models/api/resources'
import { IntegrationType } from 'models/integration/types'

import { CARD_LINK_TEST_ID } from '../../Card'
import Mine, { LOCAL_STORAGE_KEY } from '../Mine'

const mockStore = configureMockStore([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [{ id: 2, type: IntegrationType.Shopify }],
    }),
})

describe('<Mine />', () => {
    const mockApi = new MockAdapter(client)

    beforeEach(() => {
        mockApi.reset()
    })

    it('should show a loader while fetching data', () => {
        render(
            <Provider store={store}>
                <Mine />
            </Provider>,
        )
        expect(screen.getByText(/Loading more/))
    })

    it('should show installed integrations and apps only', async () => {
        const installedTitle = 'same same'
        const installedAppData = {
            ...appData,
            categories: [],
            is_installed: true,
            name: installedTitle,
        }

        mockApi
            .onGet('/api/apps/installed/')
            .reply(200, { data: [installedAppData] })
        render(
            <Provider store={store}>
                <Mine />
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText('Shopify'))
        expect(screen.getByText(installedTitle))
        expect(screen.queryByText('BigCommerce')).toBe(null)
    })

    it('should show a message when no apps are installed yet', async () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })

        mockApi.onGet('/api/apps/').reply(200, { data: [] })

        render(
            <Provider store={store}>
                <Mine />
            </Provider>,
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText('You don’t have any apps installed'))
        expect(screen.queryAllByTestId(CARD_LINK_TEST_ID).length).toBe(0)
    })

    it('should show a notification', () => {
        render(
            <Provider store={store}>
                <Mine />
            </Provider>,
        )
        expect(screen.getByText(/Please note/))
    })

    it('should show not show a notification', () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(true))

        render(
            <Provider store={store}>
                <Mine />
            </Provider>,
        )
        expect(screen.queryByText(/Please note/)).toBe(null)
    })
})
