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

const integrations = fromJS({
    integrations: Array.from({ length: 5 }, (_, index) => ({ id: index })),
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
            billing: fromJS({
                products,
            }),
            integrations,
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
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: LOW_INTEGRATION_PLAN_ID,
                    },
                },
            }),
            billing: fromJS({
                products,
            }),
            integrations,
        })
        const { container } = renderWithRouter(
            <Provider store={store}>
                <LimitWarning />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
