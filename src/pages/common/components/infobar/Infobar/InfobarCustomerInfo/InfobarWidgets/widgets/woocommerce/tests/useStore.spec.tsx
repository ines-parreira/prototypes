import {fromJS} from 'immutable'
import React, {ReactNode} from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore, {MockGetState} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {CombinedState} from 'redux'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import {RootState, StoreDispatch, StoreState} from 'state/types'
import {useStore} from '../useStore'

const integrationContextValue = {
    integrationId: 123,
    integration: fromJS({
        meta: {
            store_uuid: '5f240ffc-6a11-4d81-95ee-3ff1a90ed854',
        },
    }),
}

const integrationContextValueNoMeta = {
    integrationId: 123,
    integration: fromJS({}),
}

const defaultStateCustomer = {
    customers: fromJS({
        active: {
            lastname: '',
            meta: {
                name_set_via: 'woocommerce',
            },
            active: true,
            ecommerce_data: {
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
            },
        },
    }),
}

const defaultStateCustomerEcommerceDataEmpty = {
    customers: fromJS({
        active: {
            lastname: '',
            meta: {
                name_set_via: 'woocommerce',
            },
            active: true,
            ecommerce_data: {},
        },
    }),
}

const defaultStateCustomerNoEcommerceData = {
    customers: fromJS({
        active: {
            lastname: '',
            meta: {
                name_set_via: 'woocommerce',
            },
            active: true,
            ecommerce_data: {'5f240ffc-6a11-4d81-95ee-3ff1a90ed854': {}},
        },
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

function createWrapper(
    integrationContext: IntegrationContextType,
    state:
        | Partial<CombinedState<StoreState>>
        | MockGetState<Partial<CombinedState<StoreState>>>
        | undefined
) {
    return ({children}: {children: ReactNode}) => (
        <Provider store={mockStore(state)}>
            <IntegrationContext.Provider value={integrationContext}>
                {children}
            </IntegrationContext.Provider>
        </Provider>
    )
}

describe('utils', () => {
    describe('useStore', () => {
        it('should return the ecommerce store in customer context', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(
                    integrationContextValue,
                    defaultStateCustomer
                ),
            })
            expect(result).toMatchSnapshot()
        })

        it('should return the ecommerce store in ticket context', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(
                    integrationContextValue,
                    defaultStateTicket
                ),
            })
            expect(result).toMatchSnapshot()
        })

        it('should return null because the state is undefined', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(integrationContextValue, undefined),
            })
            expect(result).toMatchSnapshot()
        })

        it('should return null because the integration meta is empty', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(
                    integrationContextValueNoMeta,
                    defaultStateCustomer
                ),
            })
            expect(result).toMatchSnapshot()
        })

        it('should return null because the ecommerce_data is empty', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(
                    integrationContextValue,
                    defaultStateCustomerNoEcommerceData
                ),
            })
            expect(result).toMatchSnapshot()
        })

        it('should return null because the ecommerce_data is missing', () => {
            const {result} = renderHook(() => useStore(), {
                wrapper: createWrapper(
                    integrationContextValue,
                    defaultStateCustomerEcommerceDataEmpty
                ),
            })
            expect(result).toMatchSnapshot()
        })
    })
})
