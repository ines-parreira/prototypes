import React from 'react'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {Integration} from 'models/integration/types'
import {assumeMock} from 'utils/testing'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import IntegrationRow from 'pages/integrations/integration/components/app/IntegrationRow'
import {getReconnectUrl} from 'pages/integrations/integration/components/app/helpers'

jest.mock('../helpers')
const getReconnectUrlMock = assumeMock(getReconnectUrl)
getReconnectUrlMock.mockImplementation(() => 'https://test.test/')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const appStore = mockStore()

describe('<IntegrationRow/>', () => {
    describe('render()', () => {
        it('should render a connected integration with the right data from meta for app type', () => {
            const integration = {
                id: 1,
                type: 'app',
                application_id: '1',
                name: 'my app',
                meta: {address: '@myapp'},
            } as Integration
            const {getByText} = render(
                <Provider store={appStore}>
                    <TableWrapper>
                        <TableBody>
                            <IntegrationRow
                                integration={integration}
                                connectUrl="https://test.test"
                            />
                        </TableBody>
                    </TableWrapper>
                </Provider>
            )

            expect(getByText('my app')).toBeDefined()
            expect(getByText('@myapp')).toBeDefined()
        })
    }),
        describe('render()', () => {
            it('should render a connected integration with the right data from meta for ecom type', () => {
                const integration = {
                    id: 1,
                    type: 'ecom',
                    application_id: '1',
                    name: 'my ecom store',
                    meta: {store_uuid: '@store'},
                } as Integration

                const {getByText} = render(
                    <Provider store={appStore}>
                        <TableWrapper>
                            <TableBody>
                                <IntegrationRow
                                    integration={integration}
                                    connectUrl="https://test.test"
                                />
                            </TableBody>
                        </TableWrapper>
                    </Provider>
                )

                expect(getByText('my ecom store')).toBeDefined()
                expect(getByText('@store')).toBeDefined()
            })
        }),
        describe('render()', () => {
            it('should render a disconnected integration with a button to reconnect', () => {
                const integration = {
                    id: 2,
                    type: 'app',
                    application_id: '1',
                    name: 'my deactivated app',
                    meta: {address: '@deactivatedapp'},
                    deactivated_datetime: '2021-01-01T00:00:00Z',
                } as Integration

                const {container, getByText} = render(
                    <Provider store={appStore}>
                        <TableWrapper>
                            <TableBody>
                                <IntegrationRow
                                    integration={integration}
                                    connectUrl="https://test.test"
                                />
                            </TableBody>
                        </TableWrapper>
                    </Provider>
                )

                expect(getByText('my deactivated app')).toBeDefined()
                expect(getByText('@deactivatedapp')).toBeDefined()
                expect(container.querySelector('a')?.href).toBe(
                    'https://test.test/'
                )
            })
        })
})
