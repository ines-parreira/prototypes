import React from 'react'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {Integration} from 'models/integration/types'
import {assumeMock} from 'utils/testing'
import ConnectionsList from 'pages/integrations/ConnectionsList'
import {getReconnectUrl} from 'pages/integrations/helpers'

jest.mock('../helpers')
const getReconnectUrlMock = assumeMock(getReconnectUrl)
getReconnectUrlMock.mockImplementation(() => 'https://test.test/')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const appStore = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'app',
                application_id: '1',
                name: 'my app',
                meta: {address: '@myapp'},
            } as Integration,
            {
                id: 2,
                type: 'app',
                application_id: '1',
                name: 'my deactivated app',
                meta: {address: '@deactivatedapp'},
                deactivated_datetime: '2021-01-01T00:00:00Z',
            } as Integration,
        ],
    }),
} as unknown as RootState)

const ecomStore = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'ecom',
                application_id: '1',
                name: 'my ecom store',
                meta: {store_uuid: '@store'},
            } as Integration,
            {
                id: 2,
                type: 'ecom',
                application_id: '1',
                name: 'my deactivated ecom store',
                meta: {store_uuid: '@deactivatedstore'},
                deactivated_datetime: '2021-01-01T00:00:00Z',
            } as Integration,
        ],
    }),
} as unknown as RootState)

describe('<ConnectionsList/>', () => {
    describe('render()', () => {
        it('should render a list of connected app integrations with a button showing the disconnected one', () => {
            const {container, getByText} = render(
                <Provider store={appStore}>
                    <ConnectionsList appId="1" connectUrl="https://test.test" />
                </Provider>
            )

            expect(getByText('my app')).toBeDefined()
            expect(getByText('@myapp')).toBeDefined()
            expect(getByText('my deactivated app')).toBeDefined()
            expect(getByText('@deactivatedapp')).toBeDefined()
            expect(container.querySelector('a')?.href).toBe(
                'https://test.test/'
            )
        })
    }),
        describe('render()', () => {
            it('should render a list of connected ecom integrations with a button showing the disconnected one', () => {
                const {container, getByText} = render(
                    <Provider store={ecomStore}>
                        <ConnectionsList
                            appId="1"
                            connectUrl="https://test.test"
                        />
                    </Provider>
                )

                expect(getByText('my ecom store')).toBeDefined()
                expect(getByText('@store')).toBeDefined()
                expect(getByText('my deactivated ecom store')).toBeDefined()
                expect(getByText('@deactivatedstore')).toBeDefined()
                expect(container.querySelector('a')?.href).toBe(
                    'https://test.test/'
                )
            })
        })
})
