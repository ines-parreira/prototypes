import React from 'react'

import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import {agents} from 'fixtures/agents'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {FeatureFlagKey} from 'config/featureFlags'
import * as useLocalStorageImports from 'hooks/useLocalStorage'
import {
    HELPDESK_PRODUCT_ID,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {AccountSettingType} from 'state/currentAccount/types'
import useRuleSuggestionForDemos from '../useRuleSuggestionForDemos'

const mockStore = configureMockStore([thunk])
const store = {
    currentUser: fromJS(agents[0]),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPrice.price_id,
            },
        },
    }),
    billing: fromJS({...billingState}),
}

const useLocalStorageSpy = jest.spyOn(
    useLocalStorageImports,
    'default'
) as jest.Mock

const ticketId = 1

describe('useRuleSuggestionForDemos', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketDemoSuggestion]: 100,
        }))
    })

    useLocalStorageSpy.mockReturnValue([])

    describe('shouldDisplayDemoSuggestion', () => {
        it('should return true', () => {
            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeTruthy()
        })

        it('should return true [ADDON]', () => {
            const addonAccountStore = {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        status: 'active',
                        products: automationSubscriptionProductPrices,
                    },
                }),
            }

            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(addonAccountStore)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeTruthy()
        })

        it('should return false [FREQUENCY]', () => {
            jest.spyOn(LD, 'useFlags').mockImplementationOnce(() => ({
                [FeatureFlagKey.TicketDemoSuggestion]: 0,
            }))

            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [ACCOUNT TYPE]', () => {
            const basicAccountStore = {
                ...store,
                currentAccount: fromJS({...account}),
            }

            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(basicAccountStore)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [DISMISS THRESHOLD]', () => {
            const demoSuggestionDismissedTickets = [2, 3, 4]
            useLocalStorageSpy.mockReturnValueOnce([
                demoSuggestionDismissedTickets,
            ])
            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [DISMISS TICKET]', () => {
            const demoSuggestionDismissedTickets = [1]
            useLocalStorageSpy.mockReturnValueOnce([
                demoSuggestionDismissedTickets,
            ])
            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [ACCOUNT SETTING]', () => {
            const dismissedAccountSettingStore = {
                ...store,
                currentAccount: fromJS({
                    ...account,
                    settings: [
                        {
                            type: AccountSettingType.InTicketSuggestion,
                            data: {
                                is_demo_hidden: true,
                            },
                        },
                    ],
                }),
            }

            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider
                            store={mockStore(dismissedAccountSettingStore)}
                        >
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [MACRO PREFILL]', () => {
            const macroPrefillTicketStore = {
                ...store,
                ticket: fromJS({
                    state: {topRankMacroState: {macroId: 8, state: 'pending'}},
                }),
            }

            const {result} = renderHook(
                () => useRuleSuggestionForDemos(ticketId),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(macroPrefillTicketStore)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })
    })

    it('should add ticketId to dismissed tickets', () => {
        const demoSuggestionDismissedTickets = [2]
        const setDemoSuggestionDismissedTickets = jest.fn()
        useLocalStorageSpy.mockReturnValueOnce([
            demoSuggestionDismissedTickets,
            setDemoSuggestionDismissedTickets,
        ])
        const {result} = renderHook(() => useRuleSuggestionForDemos(ticketId), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        result.current.setDemoSuggestionSettingPerUser()

        expect(setDemoSuggestionDismissedTickets).toHaveBeenCalled()
    })
})
