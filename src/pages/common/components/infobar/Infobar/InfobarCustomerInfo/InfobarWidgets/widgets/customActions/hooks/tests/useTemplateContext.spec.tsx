import React from 'react'
import {renderHook} from '@testing-library/react-hooks'

import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import {AppContext} from 'providers/infobar/AppContext'
import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'

import {useTemplateContext} from '../useTemplateContext'

const defaultTicket = {
    id: 'ticket_id',
}
const defaultCustomer = {
    id: 'customer_id',
}
const defaultCurrentUser = {
    id: 'current_user_id',
    email: 'current_user_email',
    name: 'current_user_name',
    lastname: 'current_user_last_name',
    firstname: 'current_user_first_name',
}

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((anything: unknown) => anything),
}))
jest.mock('state/customers/selectors', () => ({
    getActiveCustomer: defaultCustomer,
}))
jest.mock('state/ticket/selectors', () => ({
    getTicket: defaultTicket,
}))
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserState: {
        toJS: () => defaultCurrentUser,
    },
}))

const defaultSource = {
    ok: true,
}

describe('useTemplateContext', () => {
    // With react 18, you will be able to test this by using standard `.toThrow()` assertion
    it('should not break if source is not a record', () => {
        expect(
            renderHook(() => useTemplateContext('source')).result.error
        ).not.toBeDefined()
        expect(
            renderHook(() => useTemplateContext(['source'])).result.error
        ).not.toBeDefined()
        expect(
            renderHook(() => useTemplateContext()).result.error
        ).not.toBeDefined()
    })
    it("should return a context merged with the provided source if it's a record", () => {
        const {result} = renderHook(() => useTemplateContext(defaultSource))
        expect(result.current.context).toHaveProperty('ok', true)
    })
    it('should return a context with ticket and user', () => {
        const {result} = renderHook(() => useTemplateContext(defaultSource))
        expect(result.current.context.ticket).toBe(defaultTicket)
        expect(result.current.context.customer).toBe(defaultCustomer)
    })
    it("should return a context with a subset of the current user's data", () => {
        const {result} = renderHook(() => useTemplateContext(defaultSource))
        expect(defaultCurrentUser).toEqual(
            expect.objectContaining(result.current.context.current_user)
        )
    })
    it('should return variables', () => {
        const {result} = renderHook(() => useTemplateContext(defaultSource), {
            wrapper: ({children}) => (
                <IntegrationContext.Provider
                    value={{integrationId: 1} as IntegrationContextType}
                >
                    <AppContext.Provider value={{appId: '2'}}>
                        <WidgetListContext.Provider
                            value={{currentListIndex: 1}}
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
