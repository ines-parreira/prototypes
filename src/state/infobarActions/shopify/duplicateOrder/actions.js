// @flow

import {fromJS, type Record} from 'immutable'
import _debounce from 'lodash/debounce'
import {type AxiosResponse} from 'axios'

import {
    ShopifyAction
} from '../../../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/Order'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration'
import {
    addCustomLineItem,
    addVariant,
    initDraftOrderPayload
} from '../../../../business/shopify/draftOrder'
import {getDiscountAmount, refreshAppliedDiscounts} from '../../../../business/shopify/discount'
import {formatPercentage, formatPrice} from '../../../../business/shopify/number'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import {getDraftOrderTotalLineItemsPrice} from '../../../../business/shopify/lineItem'
import localStorageManager from '../../../../services/localStorageManager'
import type {IntegrationDataItem} from '../../../../models/integration'
import * as Shopify from '../../../../constants/integrations/shopify'
import type {dispatchType, getStateType} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi'
import {executeAction} from '../../../infobar/actions'
import {notify} from '../../../notifications/actions'

import {getDuplicateOrderState} from './selectors'
import {
    SET_DEFAULT_SHIPPING_LINE,
    SET_DRAFT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS
} from './constants'

const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
let _gorgiasApi = null

const api = (): GorgiasApi => {
    if (!_gorgiasApi) {
        _gorgiasApi = new GorgiasApi()
    }

    return _gorgiasApi
}

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

export const onInit = (integrationId: number, order: Record<Shopify.Order>, onError: () => void) =>
    async (dispatch: dispatchType) => {
        dispatch(setLoading(true, 'Fetching products...'))

        const products = await loadProducts(integrationId, order)
        const draftOrderPayload = initDraftOrderPayload(order, products)
        const defaultShippingLine = draftOrderPayload.get('shipping_line') || null
        const payload = getDuplicateOrderPayload(draftOrderPayload)

        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_OPEN, {
            orderId: order.get('id'),
        })

        return Promise.all([
            dispatch(setPayload(payload)),
            dispatch(setDraftOrder(payload)),
            dispatch(createDraftOrder(integrationId, payload, onError)),
            dispatch(setProducts(products)),
            dispatch(setDefaultShippingLine(defaultShippingLine)),
        ])
    }

export const onCleanUp = (integrationId: number) => () => {
    deleteTemporaryDraftOrders(integrationId)
}

const deleteTemporaryDraftOrders = _debounce(async (integrationId: number) => {
    const ids = shopifyLocalStorage.draftOrders.getList()

    for (const draftOrderId of ids) {
        try {
            await api().deleteDraftOrder(integrationId, draftOrderId)
        } catch (error) {
            console.error(error)
        }
    }

    shopifyLocalStorage.draftOrders.setList([])
}, 1000)

export const createDraftOrder =
    (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>, onError: () => void) =>
        async (dispatch: dispatchType) => {
            try {
                dispatch(setLoading(true, 'Creating draft order...'))

                const [draftOrder, pollingConfig] = await api().createDraftOrder(integrationId, payload)
                const draftOrderId = draftOrder.get('id')

                shopifyLocalStorage.draftOrders.addListItem(draftOrderId)
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
                    const [draftOrder, pollingConfig] = await api().getDraftOrder(integrationId, draftOrderId)
                    dispatch(setDraftOrder(draftOrder))

                    resolve(
                        pollingConfig
                            ? dispatch(pollDraftOrder(integrationId, draftOrderId, pollingConfig))
                            : dispatch(setLoading(false))
                    )
                } catch (error) {
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
    const generator = api().getIntegrationDataItems<Shopify.Product>(
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

export const onPayloadChange = (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        const newPayload = refreshAppliedDiscounts(payload)
        dispatch(setPayload(newPayload))
        dispatch(setLoading(true, 'Updating draft order...'))
        return updateDraftOrder(integrationId, dispatch, getState)
    }

const updateDraftOrder = _debounce(async (integrationId: number, dispatch: dispatchType, getState: getStateType) => {
    try {
        dispatch(setLoading(true, 'Updating draft order...'))

        const state = getState()
        const draftOrder = getDuplicateOrderState(state).get('draftOrder')
        const payload = getDuplicateOrderState(state).get('payload')
        const draftOrderId = draftOrder.get('id')
        const [newDraftOrder, pollingConfig] = await api().updateDraftOrder(integrationId, payload, draftOrderId)

        dispatch(setDraftOrder(newDraftOrder))

        return pollingConfig
            ? dispatch(pollDraftOrder(integrationId, draftOrderId, pollingConfig))
            : dispatch(setLoading(false))
    } catch (error) {
        console.error(error)
        return dispatch(onApiError(error, 'Error while updating draft order'))
    }
}, 500)

export const addRow = (integrationId: number, product: Shopify.Product, variant: Shopify.Variant) =>
    (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()
        const payload = getDuplicateOrderState(state).get('payload')
        const products = getDuplicateOrderState(state).get('products')
        const newPayload = addVariant(payload, product, variant)
        const newProducts = new Map(products)

        if (!newProducts.has(product.id)) {
            newProducts.set(product.id, fromJS(product))
        }

        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_ADDED, {
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
        const payload = getDuplicateOrderState(state).get('payload')
        const newPayload = addCustomLineItem(payload, lineItem)

        return dispatch(onPayloadChange(integrationId, newPayload))
    }

export const onCancel = (integrationId: number, via: string) => () => {
    _gorgiasApi = null
    deleteTemporaryDraftOrders(integrationId)

    segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_CANCEL, {
        via,
    })
}

export const onSubmit = () => (dispatch: dispatchType, getState: getStateType) => {
    const state = getState()
    const draftOrder = getDuplicateOrderState(state).get('draftOrder')
    const id = draftOrder.get('id')
    shopifyLocalStorage.draftOrders.removeListItem(id)
}

export const onReset = () => (dispatch: dispatchType) => resetState(dispatch)

export const resetState = _debounce((dispatch: dispatchType) => dispatch(setInitialState()), 250)

export const onEmailInvoice = (
    integrationId: number,
    customerId: number,
    orderId: number,
    invoicePayload: Record<Shopify.DraftOrderInvoice>,
    onSuccess: () => void,
) => (dispatch: dispatchType, getState: getStateType): Promise<void> => {
    return new Promise((resolve) => {
        dispatch(setLoading(true, 'Sending invoice...'))

        const state = getState()
        const draftOrder = getDuplicateOrderState(state).get('draftOrder')
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

        shopifyLocalStorage.draftOrders.removeListItem(draftOrderId)

        dispatch(executeAction(
            ShopifyAction.SEND_DRAFT_ORDER_INVOICE,
            integrationId.toString(),
            customerId.toString(),
            payload,
            callback,
        ))
    })
}
