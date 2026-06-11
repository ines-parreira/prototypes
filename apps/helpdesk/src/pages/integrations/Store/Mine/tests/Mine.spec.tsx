import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { dummyAppListData as appData } from 'fixtures/apps'
import { IntegrationType } from 'models/integration/types'

import { CARD_LINK_TEST_ID } from '../../Card'
import { LOCAL_STORAGE_KEY, Mine } from '../Mine'

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
        render(<Mine />, {
            storeState: store.getState() as object,
        })
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
        render(<Mine />, {
            storeState: store.getState() as object,
        })
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
        render(<Mine />, {
            storeState: store.getState() as object,
        })
        await waitFor(() => {
            expect(screen.queryByText(/Loading/)).toBe(null)
        })
        expect(screen.getByText('You don’t have any apps installed'))
        expect(screen.queryAllByTestId(CARD_LINK_TEST_ID).length).toBe(0)
    })
    it('should show a notification', () => {
        render(<Mine />, {
            storeState: store.getState() as object,
        })
        expect(screen.getByText(/Please note/))
    })
    it('should show not show a notification', () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(true))
        render(<Mine />, {
            storeState: store.getState() as object,
        })
        expect(screen.queryByText(/Please note/)).toBe(null)
    })
})
