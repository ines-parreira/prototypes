import { useFlag } from '@repo/feature-flags'
import * as hooksImports from '@repo/hooks'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { billingState } from 'fixtures/billing'
import {
    HELPDESK_PRODUCT_ID,
    proMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { AccountSettingType } from 'state/currentAccount/types'

import useRuleSuggestionForDemos from '../useRuleSuggestionForDemos'

const mockStore = configureMockStore([thunk])
const store = {
    currentUser: fromJS(agents[0]),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPlan.plan_id,
            },
        },
    }),
    billing: fromJS({ ...billingState }),
}

const useLocalStorageSpy = jest.spyOn(
    hooksImports,
    'useLocalStorage',
) as jest.Mock

const ticketId = 1

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))
const mockUseAiAgentAccess = useAiAgentAccess as jest.Mock

describe('useRuleSuggestionForDemos', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(100)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    useLocalStorageSpy.mockReturnValue([])

    describe('shouldDisplayDemoSuggestion', () => {
        it('should return true', () => {
            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeTruthy()
        })

        it('should return true [ADDON]', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

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

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(addonAccountStore)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeTruthy()
        })

        it('should return false [FREQUENCY]', () => {
            mockUseFlag.mockReturnValue(0)

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [ACCOUNT TYPE]', () => {
            const basicAccountStore = {
                ...store,
                currentAccount: fromJS({ ...account }),
            }

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(basicAccountStore)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [DISMISS THRESHOLD]', () => {
            const demoSuggestionDismissedTickets = [2, 3, 4]
            useLocalStorageSpy.mockReturnValueOnce([
                demoSuggestionDismissedTickets,
            ])
            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [DISMISS TICKET]', () => {
            const demoSuggestionDismissedTickets = [1]
            useLocalStorageSpy.mockReturnValueOnce([
                demoSuggestionDismissedTickets,
            ])
            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                },
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

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider
                            store={mockStore(dismissedAccountSettingStore)}
                        >
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return false [MACRO PREFILL]', () => {
            const macroPrefillTicketStore = {
                ...store,
                ticket: fromJS({
                    state: {
                        topRankMacroState: { macroId: 8, state: 'pending' },
                    },
                }),
            }

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(macroPrefillTicketStore)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeFalsy()
        })

        it('should return true [AI AGENT ACCESS]', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useRuleSuggestionForDemos(ticketId, true),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(store)}>{children}</Provider>
                    ),
                },
            )

            expect(result.current.shouldDisplayDemoSuggestion).toBeTruthy()
        })
    })

    it('should add ticketId to dismissed tickets', () => {
        const demoSuggestionDismissedTickets = [2]
        const setDemoSuggestionDismissedTickets = jest.fn()
        useLocalStorageSpy.mockReturnValueOnce([
            demoSuggestionDismissedTickets,
            setDemoSuggestionDismissedTickets,
        ])
        const { result } = renderHook(
            () => useRuleSuggestionForDemos(ticketId, true),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

        result.current.setDemoSuggestionSettingPerUser()

        expect(setDemoSuggestionDismissedTickets).toHaveBeenCalled()
    })
})
