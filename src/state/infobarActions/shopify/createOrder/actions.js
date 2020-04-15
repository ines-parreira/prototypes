// @flow

import {fromJS, type Record} from 'immutable'
import _debounce from 'lodash/debounce'
import axios, {type AxiosResponse} from 'axios'
import moment from 'moment'

import {
    ShopifyAction
} from '../../../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/constants'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration'
import {addCustomLineItem, addVariant, initDraftOrderPayload} from '../../../../business/shopify/draftOrder'
import {getDiscountAmount, refreshAppliedDiscounts} from '../../../../business/shopify/discount'
import {getDraftOrderTotalLineItemsPrice} from '../../../../business/shopify/lineItem'
import {formatPercentage, formatPrice} from '../../../../business/shopify/number'
import {DRAFT_ORDER_DELETE_AFTER} from '../../../../config/integrations/shopify'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import localStorageManager from '../../../../services/localStorageManager'
import type {IntegrationDataItem} from '../../../../models/integration'
import * as Shopify from '../../../../constants/integrations/shopify'
import type {dispatchType, getStateType} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi'
import {executeAction} from '../../../infobar/actions'
import {notify} from '../../../notifications/actions'

import {getCreateOrderState} from './selectors'
import {
    SET_DEFAULT_SHIPPING_LINE,
    SET_DRAFT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS
} from './constants'

const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
let _apiInstances = {}

const getApiInstance = (key: string) => (): GorgiasApi => {
    if (!_apiInstances[key]) {
        _apiInstances[key] = new GorgiasApi()
    }

    return _apiInstances[key]
}

const getPollApi = getApiInstance('poll')
const getUpdateApi = getApiInstance('update')

const setLoading = (loading: boolean, message: ?string = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setPayload = (payload) => ({
    type: SET_PAYLOAD,
    payload,
})

const setDraftOrder = (draftOrder) => ({
    type: SET_DRAFT_ORDER,
    draftOrder,
})

const setProducts = (products) => ({
    type: SET_PRODUCTS,
    products,
})

const setDefaultShippingLine = (defaultShippingLine) => ({
    type: SET_DEFAULT_SHIPPING_LINE,
    defaultShippingLine,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const getDuplicateOrderPayload = (
    payload: Record<$Shape<Shopify.DraftOrder>>
): Record<$Shape<Shopify.DraftOrder>> => {
    // Apply a 100% discount
    const totalLineItemsPrice = getDraftOrderTotalLineItemsPrice(payload)
    const currency = payload.get('currency')
    const value = formatPercentage(100)
    const type = 'percentage'
    const amount = getDiscountAmount(totalLineItemsPrice, type, value)

    const appliedDiscount: Shopify.AppliedDiscount = fromJS({
        title: '',
        value,
        value_type: type,
        amount: formatPrice(amount, currency, true),
    })

    // Set shipping price to 0
    const shippingLine = !!payload.get('shipping_line')
        ? payload.get('shipping_line').set('price', formatPrice(0, currency))
        : null

    return payload
        .set('applied_discount', appliedDiscount)
        .set('shipping_line', shippingLine)
}

export const onInit = (
    integrationId: number,
    order: ?Record<Shopify.Order>,
    customer: Record<$Shape<Shopify.Customer>>,
    currencyCode: string,
    onError: () => void,
) =>
    async (dispatch: dispatchType) => {
        // Duplicate existing order:
        if (order) {
            dispatch(setLoading(true, 'Fetching products...'))

            const orderId = order.get('id')
            const products = await loadProducts(integrationId, order)
            const draftOrderPayload = initDraftOrderPayload(customer, order, products)
            const defaultShippingLine = draftOrderPayload.get('shipping_line') || null
            const payload = getDuplicateOrderPayload(draftOrderPayload)

            return Promise.all([
                dispatch(setPayload(payload)),
                dispatch(setDraftOrder(payload)),
                dispatch(createDraftOrder(integrationId, orderId, payload, onError)),
                dispatch(setProducts(products)),
                dispatch(setDefaultShippingLine(defaultShippingLine)),
            ])
        }

        // Create order from scratch:
        let payload = initDraftOrderPayload(customer)

        if (!payload.get('currency')) {
            payload = payload.set('currency', currencyCode)
        }

        return Promise.all([
            dispatch(setPayload(payload)),
            dispatch(setDraftOrder(payload)),
        ])
    }

export const onInitCleanUp = (integrationId: number) => async () => {
    await deleteTemporaryDraftOrders(integrationId)

    // TODO(@samy): remove that in a few weeks, it was the old key. Now we use "infobar/actions/shopify/draft-orders"
    window.localStorage.removeItem('infobar/actions/shopify/duplicate-order/draft-order-ids')
}

const deleteTemporaryDraftOrders = _debounce(async (integrationId: number) => {
    const draftOrders = shopifyLocalStorage.draftOrders.getMap()

    for (const [id, createdAt] of draftOrders.entries()) {
        try {
            const now = moment()
            const limit = moment(createdAt).add(...DRAFT_ORDER_DELETE_AFTER)

            if (now > limit) {
                await deleteTemporaryDraftOrder(integrationId, id)
            }
        } catch (error) {
            console.error(error)
        }
    }
}, 1000)

const deleteTemporaryDraftOrder = async (integrationId, draftOrderId) => {
    const api = new GorgiasApi()
    await api.deleteDraftOrder(integrationId, draftOrderId)
    shopifyLocalStorage.draftOrders.deleteMapItem(draftOrderId)
}

export const createDraftOrder =
    (integrationId: number, orderId: ?number, payload: Record<$Shape<Shopify.DraftOrder>>, onError: () => void) =>
        async (dispatch: dispatchType) => {
            try {
                dispatch(setLoading(true, 'Creating draft order...'))

                const api = new GorgiasApi()
                const [draftOrder, pollingConfig] = await api.createDraftOrder(integrationId, payload, orderId)
                const draftOrderId = draftOrder.get('id')

                shopifyLocalStorage.draftOrders.setMapItem(draftOrderId, moment().format())
                dispatch(setDraftOrder(draftOrder))

                return pollingConfig
                    ? dispatch(pollDraftOrder(integrationId, draftOrderId, pollingConfig))
                    : dispatch(setLoading(false))
            } catch (error) {
                console.error(error)
                onError()
                return dispatch(onApiError(error, 'Error while creating draft order'))
            }
        }

export const onApiError = (error: Object, defaultMessage: string) => (dispatch: dispatchType) => {
    const message = error.response && error.response.data && error.response.data.error
        ? error.response.data.error.msg
        : null

    dispatch(setLoading(false))
    dispatch(notify({
        status: 'error',
        message: message || defaultMessage,
        allowHTML: true,
    }))
}

export const pollDraftOrder = (integrationId: number, draftOrderId: number, pollingConfig: Shopify.PollingConfig) =>
    async (dispatch: dispatchType) => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const api = getPollApi()
                    api.cancelPendingRequests(true)

                    const [draftOrder, pollingConfig] = await api.getDraftOrder(integrationId, draftOrderId)
                    dispatch(setDraftOrder(draftOrder))

                    resolve(
                        pollingConfig
                            ? dispatch(pollDraftOrder(integrationId, draftOrderId, pollingConfig))
                            : dispatch(setLoading(false))
                    )
                } catch (error) {
                    if (axios.isCancel(error)) {
                        return
                    }

                    console.error(error)
                    resolve(dispatch(onApiError(error, 'Error while fetching draft order')))
                }
            }, pollingConfig.retry_after * 1000)
        })
    }

export const loadProducts = async (
    integrationId: number,
    oldOrder: Record<Shopify.Order>
): Promise<Map<number, Record<Shopify.Product>>> => {
    const products = new Map()
    const productIds = oldOrder.get('line_items', []).map((lineItem) => lineItem.get('product_id'))
    const api = new GorgiasApi()
    const generator = api.getIntegrationDataItems<Shopify.Product>(
        integrationId,
        INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
        productIds,
    )

    for await (const items of generator) {
        items.forEach((item: Record<IntegrationDataItem<Shopify.Product>>) => {
            products.set(item.getIn(['data', 'id']), item.get('data'))
        })
    }

    return products
}

const getLoadingMessage = (draftOrder: Record<$Shape<Shopify.DraftOrder>>) =>
    draftOrder.get('id')
        ? 'Updating draft order...'
        : 'Creating draft order...'


export const onPayloadChange = (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()
        const draftOrder = getCreateOrderState(state).get('draftOrder')
        const loadingMessage = getLoadingMessage(draftOrder)
        const newPayload = refreshAppliedDiscounts(payload)

        dispatch(setPayload(newPayload))
        dispatch(setLoading(true, loadingMessage))

        return upsertDraftOrder(integrationId, dispatch, getState)
    }

export const upsertDraftOrder = _debounce(
    async (integrationId: number, dispatch: dispatchType, getState: getStateType) => {
        try {
            const state = getState()
            const draftOrder = getCreateOrderState(state).get('draftOrder')
            const payload = getCreateOrderState(state).get('payload')
            const loadingMessage = getLoadingMessage(draftOrder)
            const draftOrderId = draftOrder.get('id')

            dispatch(setLoading(true, loadingMessage))

            const api = getUpdateApi()
            api.cancelPendingRequests(true)

            const [newDraftOrder, pollingConfig] = await api.upsertDraftOrder(integrationId, payload, draftOrderId)
            const newDraftOrderId = newDraftOrder.get('id')
            dispatch(setDraftOrder(newDraftOrder))

            if (draftOrderId !== newDraftOrderId) {
                shopifyLocalStorage.draftOrders.setMapItem(newDraftOrderId, moment().format())
            }

            return pollingConfig
                ? dispatch(pollDraftOrder(integrationId, newDraftOrderId, pollingConfig))
                : dispatch(setLoading(false))
        } catch (error) {
            if (axios.isCancel(error)) {
                return
            }

            const state = getState()
            const draftOrder = getCreateOrderState(state).get('draftOrder')
            const draftOrderId = draftOrder.get('id')
            const defaultErrorMessage = draftOrderId
                ? 'Error while updating draft order'
                : 'Error while creating draft order'

            console.error(error)
            return dispatch(onApiError(error, defaultErrorMessage))
        }
    },
    500
)

export const addRow = (actionName: string, integrationId: number, product: Shopify.Product, variant: Shopify.Variant) =>
    (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()
        const payload = getCreateOrderState(state).get('payload')
        const products = getCreateOrderState(state).get('products')
        const newPayload = addVariant(payload, product, variant)
        const newProducts = new Map(products)

        if (!newProducts.has(product.id)) {
            newProducts.set(product.id, fromJS(product))
        }

        const eventName = actionName === ShopifyAction.CREATE_ORDER
            ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_LINE_ITEM_ADDED
            : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_ADDED

        segmentTracker.logEvent(eventName, {
            productId: product.id,
            variantId: variant.id,
        })

        return Promise.all([
            dispatch(onPayloadChange(integrationId, newPayload)),
            dispatch(setProducts(newProducts)),
        ])
    }

export const addCustomRow = (integrationId: number, lineItem: Record<$Shape<Shopify.LineItem>>) =>
    (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()
        const payload = getCreateOrderState(state).get('payload')
        const newPayload = addCustomLineItem(payload, lineItem)

        return dispatch(onPayloadChange(integrationId, newPayload))
    }

export const onCancel = (actionName: string, integrationId: number, via: string) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        getPollApi().cancelPendingRequests()
        getUpdateApi().cancelPendingRequests()
        upsertDraftOrder.cancel()
        _apiInstances = {}

        const state = getState()
        const draftOrder = getCreateOrderState(state).get('draftOrder')

        if (draftOrder) {
            const draftOrderId = draftOrder.get('id')
            await deleteTemporaryDraftOrder(integrationId, draftOrderId)
        }

        const eventName = actionName === ShopifyAction.CREATE_ORDER
            ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_CANCEL
            : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_CANCEL

        segmentTracker.logEvent(eventName, {via})
    }

export const onSubmitCleanUp = () => (dispatch: dispatchType, getState: getStateType) => {
    const state = getState()
    const draftOrder = getCreateOrderState(state).get('draftOrder')
    const id = draftOrder.get('id')
    shopifyLocalStorage.draftOrders.deleteMapItem(id)
}

export const onReset = () => (dispatch: dispatchType) => resetState(dispatch)

export const resetState = _debounce((dispatch: dispatchType) => dispatch(setInitialState()), 250)

export const onEmailInvoice = (
    integrationId: number,
    customerId: number,
    orderId: ?number,
    invoicePayload: Record<Shopify.DraftOrderInvoice>,
    onSuccess: () => void,
) => (dispatch: dispatchType, getState: getStateType): Promise<void> => {
    return new Promise((resolve) => {
        dispatch(setLoading(true, 'Sending invoice...'))

        const state = getState()
        const draftOrder = getCreateOrderState(state).get('draftOrder')
        const draftOrderId = draftOrder.get('id')
        const draftOrderName = draftOrder.get('name')

        const payload = {
            order_id: orderId,
            draft_order_id: draftOrderId,
            draft_order_name: draftOrderName,
            draft_order_invoice: invoicePayload.toJS(),
        }

        const callback = (response: AxiosResponse) => {
            setTimeout(() => {
                if (response.status !== 'error') {
                    onSuccess()

                    dispatch(notify({
                        status: 'success',
                        message: `Draft order ${draftOrderName} created, invoice successfully sent`,
                    }))
                }

                resolve(dispatch(setLoading(false)))
            }, 0)
        }

        shopifyLocalStorage.draftOrders.deleteMapItem(draftOrderId)

        dispatch(executeAction(
            ShopifyAction.SEND_DRAFT_ORDER_INVOICE,
            integrationId.toString(),
            customerId.toString(),
            payload,
            callback,
        ))
    })
}
