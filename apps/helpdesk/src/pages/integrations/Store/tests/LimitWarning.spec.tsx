import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ProductType } from 'models/billing/types'
import { renderWithRouter } from 'utils/testing'

import LimitWarning from '../LimitWarning'

const mockStore = configureMockStore([thunk])

const HELPDESK_PRODUCT_ID = 'hepdeskpid'
const LOW_INTEGRATION_PLAN_ID = '2'
const HIGH_INTEGRATIONS_PLAN_ID = '3'

const products = [
    {
        type: ProductType.Helpdesk,
        id: HELPDESK_PRODUCT_ID,
        prices: [
            {
                plan_id: LOW_INTEGRATION_PLAN_ID,
                integrations: 5,
                amount: 100,
            },
            {
                plan_id: HIGH_INTEGRATIONS_PLAN_ID,
                integrations: 150,
                amount: 100,
            },
        ],
    },
    {
        type: ProductType.Automation,
        prices: [{ amount: 100 }],
    },
]

const billingState = fromJS({ products })

const integrations = fromJS({
    integrations: Array.from({ length: 5 }, (_, index) => ({ id: index })),
})

const activeSubscriptionState = fromJS({
    current_subscription: {
        products: {
            [HELPDESK_PRODUCT_ID]: LOW_INTEGRATION_PLAN_ID,
        },
    },
})

const canceledSubscriptionState = fromJS({
    current_subscription: null,
})

describe('<LimitWarning />', () => {
    it('should render nothing if user has enough integrations available', () => {
        const store = mockStore({
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: HIGH_INTEGRATIONS_PLAN_ID,
                    },
                },
            }),
            billing: billingState,
            integrations: integrations,
        })
        const { container } = renderWithRouter(
            <Provider store={store}>
                <LimitWarning />
            </Provider>,
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render a limit warning', () => {
        const store = mockStore({
            currentAccount: activeSubscriptionState,
            billing: billingState,
            integrations,
        })
        const { container } = renderWithRouter(
            <Provider store={store}>
                <LimitWarning />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    describe('with an active subscription at the integration limit', () => {
        const renderComponent = () => {
            const store = mockStore({
                currentAccount: activeSubscriptionState,
                billing: billingState,
                integrations: integrations,
            })
            return renderWithRouter(
                <Provider store={store}>
                    <LimitWarning />
                </Provider>,
            )
        }

        it('should show "Upgrade your plan" as the action label', () => {
            const { getByRole } = renderComponent()
            expect(
                getByRole('link', { name: 'Upgrade your plan' }),
            ).toBeInTheDocument()
        })

        it('should show the account expired message', () => {
            const { getByText } = renderComponent()
            expect(
                getByText(
                    /Your account has expired\. Please resubscribe to continue using integrations\./,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('with no subscription at the integration limit', () => {
        const renderComponent = () => {
            const store = mockStore({
                currentAccount: canceledSubscriptionState,
                billing: billingState,
                integrations: integrations,
            })
            return renderWithRouter(
                <Provider store={store}>
                    <LimitWarning />
                </Provider>,
            )
        }

        it('should show "Go to billing settings" as the action label', () => {
            const { getByRole } = renderComponent()
            expect(
                getByRole('link', { name: 'Go to billing settings' }),
            ).toBeInTheDocument()
        })

        it('should show the integration limit reached message', () => {
            const { getByText } = renderComponent()
            expect(
                getByText(/Your account has reached the integration limit\./),
            ).toBeInTheDocument()
        })
    })

    describe('with an active subscription approaching the integration limit', () => {
        it('should show "Upgrade your plan" as the action label', () => {
            const store = mockStore({
                currentAccount: activeSubscriptionState,
                billing: billingState,
                integrations: fromJS({
                    integrations: Array.from({ length: 3 }, (_, index) => ({
                        id: index,
                    })),
                }),
            })
            const { getByRole } = renderWithRouter(
                <Provider store={store}>
                    <LimitWarning />
                </Provider>,
            )
            expect(
                getByRole('link', { name: 'Upgrade your plan' }),
            ).toBeInTheDocument()
        })
    })
})
