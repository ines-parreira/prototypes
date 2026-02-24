import type React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import type { RootState, StoreDispatch } from 'state/types'

import useSaveTagsInTicketDraft from '../useSaveTagsInTicketDraft'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const mockIntegrationData = {
    customer: { tags: 'existing-customer-tag' },
    orders: [
        {
            id: 123,
            tags: 'existing-tag',
            total_price: '100.00',
            line_items: [],
            fulfillment_status: null,
        },
    ],
}

const createMockState = () =>
    ({
        ticket: fromJS({
            customer: {
                integrations: { '1': mockIntegrationData },
            },
        }),
    }) as unknown as RootState

const renderWithWrapper = (
    path: string,
    dataSource: 'Customer' | 'Order' | null = 'Customer',
    integrationId: number | null = 1,
    orderId?: number | null,
) => {
    const store = mockStore(createMockState())
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[path]}>
            <Provider store={store}>
                <Route path="/tickets/:ticketId">{children}</Route>
            </Provider>
        </MemoryRouter>
    )

    const { result } = renderHook(
        () => useSaveTagsInTicketDraft(dataSource, integrationId, orderId),
        { wrapper },
    )
    return { result, store }
}

describe('useSaveTagsInTicketDraft', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should merge customer tags', () => {
        const { result, store } = renderWithWrapper('/tickets/new')

        result.current.saveTagsInDraft('new-customer-tag')

        const actions = store.getActions()
        expect(actions).toHaveLength(1)
        expect(actions[0].type).toBe('MERGE_CUSTOMER')
        expect(actions[0].customer).toEqual({
            integrations: {
                '1': {
                    customer: { tags: 'new-customer-tag' },
                    orders: mockIntegrationData.orders,
                },
            },
        })
    })

    it('should merge order tags', () => {
        const { result, store } = renderWithWrapper(
            '/tickets/new',
            'Order',
            1,
            123,
        )

        result.current.saveTagsInDraft('new-order-tag')

        const actions = store.getActions()
        expect(actions).toHaveLength(1)
        expect(actions[0].type).toBe('MERGE_CUSTOMER')
        expect(actions[0].customer).toEqual({
            integrations: {
                '1': {
                    customer: mockIntegrationData.customer,
                    orders: [
                        {
                            id: 123,
                            tags: 'new-order-tag',
                            total_price: '100.00',
                            line_items: [],
                            fulfillment_status: null,
                        },
                    ],
                },
            },
        })
    })

    it.each([
        ['ticket is not new', '/tickets/123', 'Customer' as const, 1],
        ['integrationId is null', '/tickets/new', 'Customer' as const, null],
        ['data_source is null', '/tickets/new', null, 1],
    ])('should not save tags when %s', (_, path, dataSource, integrationId) => {
        const { result, store } = renderWithWrapper(
            path,
            dataSource,
            integrationId,
        )

        result.current.saveTagsInDraft('new-customer-tag')

        expect(store.getActions()).toHaveLength(0)
    })

    it('should not save tags if integration does not exist', () => {
        const { result, store } = renderWithWrapper(
            '/tickets/new',
            'Customer',
            999,
        )

        result.current.saveTagsInDraft('new-customer-tag')

        expect(store.getActions()).toHaveLength(0)
    })
})
