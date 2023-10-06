import {fromJS} from 'immutable'
import React, {ReactNode} from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {RootState, StoreDispatch} from 'state/types'
import {useStore} from '../useStore'

const integrationContextValue = {
    integrationId: 123,
    integration: fromJS({
        meta: {
            store_uuid: '5f240ffc-6a11-4d81-95ee-3ff1a90ed854',
        },
    }),
}

const defaultStateCustomer = {
    customers: fromJS({
        active: fromJS({
            lastname: '',
            meta: {
                name_set_via: 'woocommerce',
            },
            active: true,
            ecommerce_data: fromJS({
                '5f240ffc-6a11-4d81-95ee-3ff1a90ed854': {
                    store: {
                        deleted_datetime: null,
                        display_name:
                            'woo-generously-electronic-soul.wpcomstaging.com',
                        helpdesk_integration_id: 333,
                        name: 'woo-generously-electronic-soul.wpcomstaging.com',
                        default_currency: 'usd',
                        currencies: ['usd'],
                        url: 'https://woo-generously-electronic-soul.wpcomstaging.com',
                        created_datetime: '2023-09-29T09:00:33.333568+00:00',
                        type: 'woocommerce',
                        id: 105,
                        uuid: '5f240ffc-6a11-4d81-95ee-3ff1a90ed854',
                        updated_datetime: null,
                    },
                },
            }),
        }),
    }),
}

const defaultStateTicket = {
    customers: fromJS({
        active: fromJS({}),
    }),
    ticket: fromJS({
        customer: fromJS({
            ecommerce_data: fromJS({
                '5f240ffc-6a11-4d81-95ee-3ff1a90ed854': {
                    store: {
                        deleted_datetime: null,
                        display_name:
                            'woo-generously-electronic-soul.wpcomstaging.com',
                        helpdesk_integration_id: 333,
                        name: 'woo-generously-electronic-soul.wpcomstaging.com',
                        default_currency: 'usd',
                        currencies: ['usd'],
                        url: 'https://woo-generously-electronic-soul.wpcomstaging.com',
                        created_datetime: '2023-09-29T09:00:33.333568+00:00',
                        type: 'woocommerce',
                        id: 105,
                        uuid: '5f240ffc-6a11-4d81-95ee-3ff1a90ed854',
                        updated_datetime: null,
                    },
                },
            }),
        }),
    }),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const wrapperCustomerState = ({children}: {children: ReactNode}) => (
    <Provider store={mockStore(defaultStateCustomer)}>
        <IntegrationContext.Provider value={integrationContextValue}>
            {children}
        </IntegrationContext.Provider>
    </Provider>
)

const wrapperTicketState = ({children}: {children: ReactNode}) => (
    <Provider store={mockStore(defaultStateTicket)}>
        <IntegrationContext.Provider value={integrationContextValue}>
            {children}
        </IntegrationContext.Provider>
    </Provider>
)

describe('utils', () => {
    describe('getAvailableLineItems', () => {
        it('should return the ecommerce store in customer context', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: wrapperCustomerState,
            })
            expect(result).toMatchSnapshot()
        })

        it('should return the ecommerce store in ticket context', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: wrapperTicketState,
            })
            expect(result).toMatchSnapshot()
        })
    })
})
