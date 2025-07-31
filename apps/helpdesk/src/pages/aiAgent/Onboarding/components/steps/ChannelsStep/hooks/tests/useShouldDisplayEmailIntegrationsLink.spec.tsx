import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account as accountFixture } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
    customHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
} from 'fixtures/productPrices'
import { useShouldDisplayEmailIntegrationsLink } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useShouldDisplayEmailIntegrationsLink'
import { Account } from 'state/currentAccount/types'
import { mockStore } from 'utils/testing'

describe('useShouldDisplayEmailIntegrationsLink', () => {
    const renderUseShouldDisplayEmailIntegrationsLink = ({
        account = accountFixture,
    }: {
        account?: Account
    }) => {
        const defaultState = {
            currentAccount: fromJS(account),
            billing: fromJS({
                ...billingState,
                products: [
                    {
                        ...helpdeskProduct,
                        prices: [...helpdeskProduct.prices, customHelpdeskPlan],
                    },
                ],
            }),
        }

        return renderHook(useShouldDisplayEmailIntegrationsLink, {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })
    }

    it('should return true when account has basic helpdesk plan', () => {
        const { result } = renderUseShouldDisplayEmailIntegrationsLink({
            account: {
                ...accountFixture,
                current_subscription: {
                    ...accountFixture.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                    },
                },
            },
        })

        expect(result.current).toBe(true)
    })

    it('should return false when account has no helpdesk plan', () => {
        const { result } = renderUseShouldDisplayEmailIntegrationsLink({
            account: {
                ...accountFixture,
                current_subscription: {
                    ...accountFixture.current_subscription,
                    products: {},
                },
            },
        })

        expect(result.current).toBe(false)
    })

    it('should return false when account has advanced helpdesk plan', () => {
        const { result } = renderUseShouldDisplayEmailIntegrationsLink({
            account: {
                ...accountFixture,
                current_subscription: {
                    ...accountFixture.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            advancedMonthlyHelpdeskPlan.price_id,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })

    it('should return false when account has enterprise helpdesk plan', () => {
        const { result } = renderUseShouldDisplayEmailIntegrationsLink({
            account: {
                ...accountFixture,
                current_subscription: {
                    ...accountFixture.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: customHelpdeskPlan.price_id,
                    },
                },
            },
        })

        expect(result.current).toBe(false)
    })
})
