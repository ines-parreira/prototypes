import React from 'react'

import { renderHook } from '@testing-library/react-hooks'

import { Customer } from 'models/customer/types'
import { Ticket } from 'models/ticket/types'
import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'
import { AppContext } from 'providers/infobar/AppContext'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicket } from 'state/ticket/selectors'
import { assumeMock } from 'utils/testing'

import { useTemplateContext } from '../useTemplateContext'

const defaultTicket = {
    id: 'ticket_id',
} as unknown as Ticket

const defaultCustomer = {
    id: 'customer_id',
} as unknown as Customer

const defaultCurrentUser = {
    id: 'current_user_id',
    email: 'current_user_email',
    name: 'current_user_name',
    lastname: 'current_user_last_name',
    firstname: 'current_user_first_name',
}

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((cb: (() => unknown) | undefined) => cb?.()),
}))
jest.mock('state/customers/selectors')
jest.mock('state/ticket/selectors')
const mockedGetActiveCustomer = assumeMock(getActiveCustomer)
const mockedGetTicket = assumeMock(getTicket)
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserState: () => ({
        toJS: () => defaultCurrentUser,
    }),
}))

const defaultSource = {
    ok: true,
}

describe('useTemplateContext', () => {
    beforeEach(() => {
        mockedGetActiveCustomer.mockReturnValue(defaultCustomer)
        mockedGetTicket.mockReturnValue(defaultTicket)
    })
    // With react 18, you will be able to test this by using standard `.toThrow()` assertion
    it('should not break if source is not a record', () => {
        expect(
            renderHook(() => useTemplateContext('source')).result.error,
        ).not.toBeDefined()
        expect(
            renderHook(() => useTemplateContext(['source'])).result.error,
        ).not.toBeDefined()
        expect(
            renderHook(() => useTemplateContext()).result.error,
        ).not.toBeDefined()
    })

    it("should return a context merged with the provided source if it's a record", () => {
        const { result } = renderHook(() => useTemplateContext(defaultSource))
        expect(result.current.context).toHaveProperty('ok', true)
    })

    it('should return a context with ticket and user', () => {
        const { result } = renderHook(() => useTemplateContext(defaultSource))
        expect(result.current.context.ticket).toEqual(
            expect.objectContaining(defaultTicket),
        )
        expect(result.current.context.customer).toEqual(
            expect.objectContaining(defaultCustomer),
        )
    })

    describe('Mapped integrations', () => {
        const integrationID = 1234
        const ticket = {
            id: 'ticket_id',
            customer: {
                integrations: {
                    [integrationID]: {
                        myMagentoData: 'myData',
                        __integration_type__: 'magento2',
                    },
                },
            },
        } as unknown as Ticket

        const customer = {
            id: 'customer_id',
            integrations: {
                [integrationID]: {
                    myShopifyData: 'myData',
                    __integration_type__: 'shopify',
                },
            },
        } as unknown as Customer

        it('should return nothing if there are multiple integrations of the same type', () => {
            mockedGetTicket.mockReturnValue({
                ...ticket,
                customer: {
                    ...ticket.customer,
                    integrations: {
                        ...ticket.customer?.integrations,
                        [1235]: {
                            myMagentoData: 'myData',
                            __integration_type__: 'magento2',
                        },
                    },
                } as unknown as Customer,
            })
            const { result } = renderHook(() =>
                useTemplateContext(defaultSource),
            )
            expect(
                result.current.context.ticket.customer.integrations.magento2,
            ).toBe(undefined)
            expect(result.current.context.customer.integrations).toEqual({})
        })

        it('should return a context with ticket mapped integrations', () => {
            mockedGetActiveCustomer.mockReturnValue(customer)
            mockedGetTicket.mockReturnValue(ticket)
            const { result } = renderHook(() =>
                useTemplateContext(defaultSource),
            )
            expect(result.current.context.ticket.customer.integrations).toEqual(
                {
                    ...ticket.customer?.integrations,
                    magento2: ticket.customer?.integrations[integrationID],
                },
            )
            expect(result.current.context.customer.integrations).toEqual(
                customer.integrations,
            )
        })

        it('should return a customer context with customer mapped integrations', () => {
            mockedGetActiveCustomer.mockReturnValue(customer)
            const { result } = renderHook(() =>
                useTemplateContext(defaultSource),
            )
            expect(result.current.context.customer.integrations).toEqual({
                ...customer.integrations,
                shopify: customer.integrations[integrationID],
            })
            expect(result.current.context.ticket.customer.integrations).toEqual(
                {},
            )
        })
    })

    it("should return a context with a subset of the current user's data", () => {
        const { result } = renderHook(() => useTemplateContext(defaultSource))
        expect(defaultCurrentUser).toEqual(
            expect.objectContaining(result.current.context.current_user),
        )
    })

    it('should return variables', () => {
        const { result } = renderHook(() => useTemplateContext(defaultSource), {
            wrapper: ({ children }) => (
                <IntegrationContext.Provider
                    value={{ integrationId: 1 } as IntegrationContextType}
                >
                    <AppContext.Provider value={{ appId: '2' }}>
                        <WidgetListContext.Provider
                            value={{ currentListIndex: 1 }}
                        >
                            {children}
                        </WidgetListContext.Provider>
                    </AppContext.Provider>
                </IntegrationContext.Provider>
            ),
        })
        expect(result.current.variables).toEqual({
            listIndex: '1',
            integrationId: '1',
            appId: '2',
        })
    })
})
