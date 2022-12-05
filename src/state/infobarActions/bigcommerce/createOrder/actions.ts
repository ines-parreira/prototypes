import _debounce from 'lodash/debounce'
import {RootState, StoreDispatch} from 'state/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import GorgiasApi from 'services/gorgiasApi'
import {
    BigCommerceCustomerAddress,
    BigCommercePayload,
    BigCommerceResponse,
    Customer,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {RESET_CART, SET_CART_ID} from './constants'
import {getCreateOrderState} from './selectors'

const _api = new GorgiasApi()

const setCartId = (cartId: Maybe<string>) => ({
    type: SET_CART_ID,
    cartId,
})

const setInitialState = () => ({
    type: RESET_CART,
})

export const onInit =
    (customer: Customer, integrationId: number) =>
    async (dispatch: StoreDispatch) => {
        const createCartResponse = await createCart(integrationId, customer)
        const cartId = createCartResponse.id
        const eventName = SegmentEvent.BigCommerceCreateOrderOpen
        logEvent(eventName)
        dispatch(setCartId(cartId))
    }

export const onCancel =
    (integrationId: number, via: string) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const createOrderState = getCreateOrderState(state)
        const cartId = createOrderState.cartId
        if (!!cartId) {
            void deleteCart(integrationId, cartId)
        }
        const eventName = SegmentEvent.BigCommerceCreateOrderCancel
        logEvent(eventName, {via})
        dispatch(setCartId(null))
    }

export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250
)

const createCart = async (
    integrationId: number,
    customer: Customer
): Promise<BigCommerceResponse> => {
    const payload: BigCommercePayload = {
        customer_id: customer.id,
        line_items: [],
    }
    return await _api.createBigCommerceCart(integrationId, payload)
}

const deleteCart = async (integrationId: number, cartId: Maybe<string>) => {
    await _api.deleteBigCommerceCart(integrationId, cartId)
}

export const addCheckoutBillingAddress =
    (
        integrationId: Maybe<number>,
        selectedAddress: Maybe<BigCommerceCustomerAddress>
    ) =>
    async (dispatch: StoreDispatch, getState: () => RootState) => {
        if (integrationId && selectedAddress) {
            const state = getState()
            const createOrderState = getCreateOrderState(state)
            const cartId = createOrderState.cartId
            if (cartId) {
                await _api.addBigCommerceCheckoutBillingAddress(
                    integrationId,
                    cartId,
                    selectedAddress
                )
            }
        }
    }
