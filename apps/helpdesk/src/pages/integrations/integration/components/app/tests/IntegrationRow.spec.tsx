import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { Integration } from 'models/integration/types'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { getReconnectUrl } from 'pages/integrations/integration/components/app/helpers'
import IntegrationRow from 'pages/integrations/integration/components/app/IntegrationRow'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('../helpers')
const getReconnectUrlMock = assumeMock(getReconnectUrl)
getReconnectUrlMock.mockImplementation(() => 'https://test.test/')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const appStore = mockStore()

describe('<IntegrationRow/>', () => {
    it('should render a connected integration with the right data from meta for app type', () => {
        const integration = {
            id: 1,
            type: 'app',
            application_id: '1',
            name: 'my app',
            meta: { address: '@myapp' },
        } as Integration
        const { container, getByText } = render(
            <Provider store={appStore}>
                <TableWrapper>
                    <TableBody>
                        <IntegrationRow
                            integration={integration}
                            connectUrl="https://test.test"
                        />
                    </TableBody>
                </TableWrapper>
            </Provider>,
        )

        expect(getByText('my app')).toBeDefined()
        expect(getByText('@myapp')).toBeDefined()
        const deleteIcon = container.querySelector('i.material-icons')
        expect(deleteIcon).toBeInTheDocument()
        if (deleteIcon) {
            expect(deleteIcon.textContent).toBe('delete')
        }
    })
    it('should render a connected integration with the right data from meta for ecom type', () => {
        const integration = {
            id: 1,
            type: 'ecom',
            application_id: '1',
            name: 'my ecom store',
            meta: { store_uuid: '@store' },
        } as Integration

        const { container, getByText } = render(
            <Provider store={appStore}>
                <TableWrapper>
                    <TableBody>
                        <IntegrationRow
                            integration={integration}
                            connectUrl="https://test.test"
                        />
                    </TableBody>
                </TableWrapper>
            </Provider>,
        )

        expect(getByText('my ecom store')).toBeDefined()
        expect(getByText('@store')).toBeDefined()
        const deleteIcon = container.querySelector('i.material-icons')
        expect(deleteIcon).toBeInTheDocument()
        if (deleteIcon) {
            expect(deleteIcon.textContent).toBe('delete')
        }
    })
    it('should show loading icon when delete button is clicked', () => {
        const integration = {
            id: 1,
            type: 'ecom',
            application_id: '1',
            name: 'my ecom store',
            meta: { store_uuid: '@store' },
        } as Integration
        const loadingIntegrationAppStore = mockStore({
            integrations: fromJS({
                state: {
                    loading: { delete: 1 },
                },
            }),
        })

        const { container } = render(
            <Provider store={loadingIntegrationAppStore}>
                <TableWrapper>
                    <TableBody>
                        <IntegrationRow
                            integration={integration}
                            connectUrl="https://test.test"
                        />
                    </TableBody>
                </TableWrapper>
            </Provider>,
        )

        const loadingIcon = container.querySelector('svg')
        expect(loadingIcon).toBeInTheDocument()
    })
    it('should render a disconnected integration with a button to reconnect', () => {
        const integration = {
            id: 2,
            type: 'app',
            application_id: '1',
            name: 'my deactivated app',
            meta: { address: '@deactivatedapp' },
            deactivated_datetime: '2021-01-01T00:00:00Z',
        } as Integration

        const { container, getByText } = render(
            <Provider store={appStore}>
                <TableWrapper>
                    <TableBody>
                        <IntegrationRow
                            integration={integration}
                            connectUrl="https://test.test"
                        />
                    </TableBody>
                </TableWrapper>
            </Provider>,
        )

        expect(getByText('my deactivated app')).toBeDefined()
        expect(getByText('@deactivatedapp')).toBeDefined()
        expect(getByText('Disconnected')).toBeDefined()
        expect(container.querySelector('button')?.id).toBe('reconnect-2')
    })
})
