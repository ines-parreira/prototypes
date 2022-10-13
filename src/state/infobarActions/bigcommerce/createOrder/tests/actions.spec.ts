import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {AnyAction} from 'redux'
import MockAdapter from 'axios-mock-adapter'
import {Customer} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {
    bigCommerceCartResponseFixture,
    bigCommerceCustomerFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {StoreDispatch} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import * as actions from 'state/infobarActions/bigcommerce/createOrder/actions'
import {initialState} from 'state/infobarActions/bigcommerce/createOrder/reducers'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

describe('infobarActions.bigcommerce.createOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const cartId = 'eed98ad3-8f2a-4558-864a-3a9e04d2cb61'
    const customer: Customer = bigCommerceCustomerFixture()
    const mockServer = new MockAdapter(client)
    let store: MockStoreEnhanced<unknown, StoreDispatch>

    const getActions = () =>
        store
            .getActions()
            .map((action: AnyAction & {payload: Record<string, unknown>}) => {
                if (action.type === 'reapop/upsertNotification') {
                    action.payload.id = 1
                }

                return action
            })
    function mockCreateCartSuccess() {
        mockServer
            .onPost(`/integrations/${IntegrationType.BigCommerce}/order/cart/`)
            .reply(201, bigCommerceCartResponseFixture())
    }

    function mockDeleteCartSuccess() {
        mockServer
            .onDelete(
                `/integrastions/${IntegrationType.BigCommerce}/order/cart/?integration_id=${integrationId}&cart_id=${cartId}`
            )
            .reply(204)
    }

    beforeEach(() => {
        store = mockStore({
            infobarActions: {
                [IntegrationType.BigCommerce]: {
                    createOrder: initialState,
                },
            },
        })

        mockServer.reset()
        window.localStorage.clear()
    })

    describe('onInit()', () => {
        it('should init the state', async () => {
            mockCreateCartSuccess()
            await store.dispatch(actions.onInit(customer, integrationId))
            expect(getActions()).toMatchSnapshot()
        })
    })
    describe('onCancel()', () => {
        it('should reset the cart id', () => {
            mockDeleteCartSuccess()
            store.dispatch(actions.onCancel(integrationId, 'header'))
            expect(getActions()).toMatchSnapshot()
        })
    })
    describe('onReset()', () => {
        it('should reset state', async () => {
            await (store.dispatch(actions.onReset()) as unknown as Promise<any>)
            expect(getActions()).toMatchSnapshot()
        })
    })
})
