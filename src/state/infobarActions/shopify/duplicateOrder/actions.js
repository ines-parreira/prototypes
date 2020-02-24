// @flow

import {fromJS, type Record} from 'immutable'
import _debounce from 'lodash/debounce'

import type {IntegrationDataItem} from '../../../../models/integration'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration'
import {
    addCustomLineItem,
    addVariant,
    formatPrice,
    getDiscountAmount,
    getTotalLineItemsPrice,
    initDraftOrderPayload,
    refreshAppliedDiscounts
} from '../../../../business/shopify/order'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import localStorageManager from '../../../../services/localStorageManager'
import * as Shopify from '../../../../constants/integrations/shopify'
import type {dispatchType, getStateType} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi'
import {notify} from '../../../notifications/actions'

import {SET_DEFAULT_SHIPPING_LINE, SET_DRAFT_ORDER, SET_LOADING, SET_PAYLOAD, SET_PRODUCTS} from './constants'
import {getDuplicateOrderState} from './selectors'

const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
let _gorgiasApi = null

const api = (): GorgiasApi => {
    if (!_gorgiasApi) {
        _gorgiasApi = new GorgiasApi()
    }

    return _gorgiasApi
}

const setLoading = (loading) => ({
    type: SET_LOADING,
    loading,
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

export const getDuplicateOrderPayload = (
    draftOrder: Record<$Shape<Shopify.DraftOrder>>
): Record<$Shape<Shopify.DraftOrder>> => {
    // Apply a 100% discount
    const totalLineItemsPrice = getTotalLineItemsPrice(draftOrder)
    const value = formatPrice(100)
    const type = 'percentage'

    const appliedDiscount: Shopify.AppliedDiscount = fromJS({
        title: '',
        value,
        value_type: type,
        amount: formatPrice(getDiscountAmount(totalLineItemsPrice, type, value)),
    })

    // Set shipping price to 0
    const shippingLine = !!draftOrder.get('shipping_line')
        ? draftOrder.get('shipping_line').set('price', formatPrice(0))
        : null

    return draftOrder
        .set('applied_discount', appliedDiscount)
        .set('shipping_line', shippingLine)
}

export const onInit = (integrationId: number, order: Record<Shopify.Order>, onError: () => void) =>
    async (dispatch: dispatchType) => {
        const draftOrder = initDraftOrderPayload(order)
        const defaultShippingLine = draftOrder.get('shipping_line') || null
        const payload = getDuplicateOrderPayload(draftOrder)

        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_OPEN, {
            orderId: order.get('id'),
        })

        return Promise.all([
            dispatch(setPayload(payload)),
            dispatch(setDraftOrder(payload)),
            dispatch(createDraftOrder(integrationId, payload, onError)),
            dispatch(loadProducts(integrationId, payload)),
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
                dispatch(setLoading(true))

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

export const loadProducts = (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>) =>
    async (dispatch: dispatchType) => {
        const products = new Map()
        const productIds = payload.get('line_items', []).map(
            (lineItem: Record<Shopify.LineItem>) => lineItem.get('product_id')
        )
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

        dispatch(setProducts(products))
    }

export const onPayloadChange = (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>) =>
    async (dispatch: dispatchType, getState: getStateType) => {
        const newPayload = refreshAppliedDiscounts(payload)
        dispatch(setPayload(newPayload))
        dispatch(setLoading(true))
        return updateDraftOrder(integrationId, dispatch, getState)
    }

const updateDraftOrder = _debounce(async (integrationId, dispatch, getState) => {
    try {
        dispatch(setLoading(true))

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
