import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import MockAdapter from 'axios-mock-adapter'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {IntegrationType} from 'models/integration/types'

import client from 'models/api/resources'
import {flushPromises} from 'utils/testing'

import {BundleInstallView} from '../BundleInstallView'
import * as betaTesterHook from '../../../../../common/hooks/useIsRevenueBetaTester'

const mockStore = configureMockStore([thunk])

const mockedServer = new MockAdapter(client)

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'My shopify store',
            },
        ],
    }),
}

describe('<BundleInstallView />', () => {
    beforeEach(() => {
        jest.spyOn(betaTesterHook, 'useIsRevenueBetaTester').mockImplementation(
            () => true
        )
    })

    afterEach(() => {
        mockedServer.reset()
    })

    it('renders install form with default options selected', () => {
        const {getByLabelText} = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <BundleInstallView />
                </Provider>
            </MemoryRouter>
        )

        expect(
            getByLabelText('1-click install', {
                selector: 'input',
            })
        ).toBeChecked()
    })

    it('submits form when using 1-click installation for Shopify', async () => {
        const {getByText} = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <BundleInstallView />
                </Provider>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Select a store'))
        fireEvent.click(getByText('My shopify store'))
        fireEvent.click(
            getByText('Install', {
                selector: 'button',
            })
        )

        await flushPromises()

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({integration_id: 1})
            )
        })
    })
})
