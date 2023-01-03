import React from 'react'
import {fromJS} from 'immutable'
import produce from 'immer'
import {render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import LD from 'launchdarkly-react-client-sdk'

import {IntegrationType} from 'models/integration/types'
import {dummyAppListData as appData} from 'fixtures/apps'
import {FeatureFlagKey} from 'config/featureFlags'
import client from 'models/api/resources'

import Mine, {LOCAL_STORAGE_KEY} from '../Mine'
import {CARD_LINK_TEST_ID} from '../Card'

const mockStore = configureMockStore([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [{id: 2, type: IntegrationType.Shopify}],
    }),
})

describe('<Mine />', () => {
    const mockApi = new MockAdapter(client)
    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.AppStore]: true,
    }))

    beforeEach(() => {
        mockApi.reset()
    })

    it('should show a loader while fetching data', () => {
        render(
            <Provider store={store}>
                <Mine />
            </Provider>
        )
        expect(screen.getByText(/Loading more/))
    })

    it('should show installed integrations and apps only', async () => {
        const installedTitle = 'same same'
        const installedAppData = produce(appData, (draftAppData) => {
            draftAppData.name = installedTitle
            draftAppData.is_installed = true
        })

        mockApi
            .onGet('/api/apps/')
            .reply(200, {data: [appData, installedAppData]})

        render(
            <Provider store={store}>
                <Mine />
            </Provider>
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText('Shopify'))
        expect(screen.getByText(installedTitle))
        expect(screen.queryByText('BigCommerce')).toBe(null)
        expect(screen.queryByText(appData.name)).toBe(null)
    })

    it('should show a message when no apps are installed yet', async () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })

        mockApi.onGet('/api/apps/').reply(200, {data: []})

        render(
            <Provider store={store}>
                <Mine />
            </Provider>
        )
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText(/no app connected/))
        expect(screen.queryAllByTestId(CARD_LINK_TEST_ID).length).toBe(0)
    })

    it('should show a notification', () => {
        render(
            <Provider store={store}>
                <Mine />
            </Provider>
        )
        expect(screen.getByText(/Please note/))
    })

    it('should show not show a notification', () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(true))

        render(
            <Provider store={store}>
                <Mine />
            </Provider>
        )
        expect(screen.queryByText(/Please note/)).toBe(null)
    })
})
