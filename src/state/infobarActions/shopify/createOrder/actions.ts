import {fromJS, List} from 'immutable'
import type {Map} from 'immutable'
import _debounce from 'lodash/debounce'
import axios, {AxiosResponse, AxiosError} from 'axios'
import moment from 'moment'

import {ShopifyActionType} from '../../../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../constants/integration.js'
import {
    addCustomLineItem,
    addVariant,
    initDraftOrderPayload,
} from '../../../../business/shopify/draftOrder.js'
import {
    getDiscountAmount,
    refreshAppliedDiscounts,
} from '../../../../business/shopify/discount.js'
import {getDraftOrderTotalLineItemsPrice} from '../../../../business/shopify/lineItem.js'
import {
    formatPercentage,
    formatPrice,
} from '../../../../business/shopify/number.js'
import {DRAFT_ORDER_DELETE_AFTER} from '../../../../config/integrations/shopify.js'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import localStorageManager from '../../../../services/localStorageManager.js'
import {
    AppliedDiscount,
    PollingConfig,
    Product,
    Variant,
    DiscountType,
} from '../../../../constants/integrations/types/shopify'
import {StoreDispatch, RootState} from '../../../types'
import GorgiasApi from '../../../../services/gorgiasApi.js'
import {executeAction} from '../../../infobar/actions'
import {notify} from '../../../notifications/actions.js'
import {NotificationStatus} from '../../../notifications/types'
import {SegmentEvent} from '../../../../store/middlewares/types/segmentTracker'
import {IntegrationDataItemType} from '../../../../models/integration/types'

import {getCreateOrderState} from './selectors'
import {
    SET_DEFAULT_SHIPPING_LINE,
    SET_DRAFT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS,
} from './constants'

const shopifyLocalStorage =
    localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
let _apiInstances: {[key: string]: GorgiasApi} = {}

const getApiInstance = (key: string) => () => {
    if (!_apiInstances[key]) {
        _apiInstances[key] = new GorgiasApi()
    }

    return _apiInstances[key]
}

const getPollApi = getApiInstance('poll')
const getUpdateApi = getApiInstance('update')

const setLoading = (loading: boolean, message: Maybe<string> = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setPayload = (payload: Map<any, any>) => ({
    type: SET_PAYLOAD,
    payload,
})

const setDraftOrder = (draftOrder: Map<any, any>) => ({
    type: SET_DRAFT_ORDER,
    draftOrder,
})

const setProducts = (products: globalThis.Map<any, any>) => ({
    type: SET_PRODUCTS,
    products,
})

const setDefaultShippingLine = (defaultShippingLine: Maybe<Map<any, any>>) => ({
    type: SET_DEFAULT_SHIPPING_LINE,
    defaultShippingLine,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const getDuplicateOrderPayload = (
    payload: Map<any, any>
): Map<any, any> => {
    // Apply a 100% discount
    const totalLineItemsPrice = getDraftOrderTotalLineItemsPrice(payload)
    const currency = payload.get('currency') as string
    const value = formatPercentage(100)
    const type = DiscountType.Percentage
    const amount = getDiscountAmount(totalLineItemsPrice, type, value)

    const appliedDiscount: AppliedDiscount = fromJS({
        title: '',
        value,
        value_type: type,
        amount: formatPrice(amount, currency, true),
    })

    // Set shipping price to 0
    const shippingLine = !!payload.get('shipping_line')
        ? (payload.get('shipping_line') as Map<any, any>).set(
              'price',
              formatPrice(0, currency)
          )
        : null

    return payload
        .set('applied_discount', appliedDiscount)
        .set('shipping_line', shippingLine)
}

export const onInit = (
    integrationId: number,
    order: Maybe<Map<any, any>>,
    customer: Map<any, any>,
    currencyCode: string,
    onError: () => void
) => async (dispatch: StoreDispatch) => {
    // Duplicate existing order:
    if (order) {
        dispatch(setLoading(true, 'Fetching products...'))

        const orderId = order.get('id') as number
        const products = await loadProducts(integrationId, order)
        const draftOrderPayload = initDraftOrderPayload(
            customer,
            order,
            products as any
            //$TsFixMe remove casting when initDraftOrderPayload is migrated
        ) as Map<any, any>
        const defaultShippingLine =
            (draftOrderPayload.get('shipping_line') as Map<any, any>) || null
        const payload = getDuplicateOrderPayload(draftOrderPayload)

        return Promise.all([
            dispatch(setPayload(payload)),
            dispatch(setDraftOrder(payload)),
            dispatch(
                createDraftOrder(integrationId, orderId, payload, onError)
            ),
            dispatch(setProducts(products)),
            dispatch(setDefaultShippingLine(defaultShippingLine)),
        ])
    }

    // Create order from scratch:
    let payload = initDraftOrderPayload(customer) as Map<any, any>

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
    window.localStorage.removeItem(
        'infobar/actions/shopify/duplicate-order/draft-order-ids'
    )
}

const deleteTemporaryDraftOrders = _debounce(async (integrationId: number) => {
    const draftOrders = shopifyLocalStorage.draftOrders.getMap()

    //$TsFixMe remove casting when shopifyLocalStorage is migrated
    for (const [id, createdAt] of draftOrders.entries() as any) {
        try {
            const now = moment()
            const limit = moment(createdAt).add(...DRAFT_ORDER_DELETE_AFTER)

            if (now.valueOf() > limit.valueOf()) {
                await deleteTemporaryDraftOrder(integrationId, id)
            }
        } catch (error) {
            console.error(error)
        }
    }
}, 1000)

const deleteTemporaryDraftOrder = async (
    integrationId: number,
    draftOrderId: number
) => {
    const api = new GorgiasApi()
    await api.deleteDraftOrder(integrationId, draftOrderId)
    shopifyLocalStorage.draftOrders.deleteMapItem(draftOrderId)
}

export const createDraftOrder = (
    integrationId: number,
    orderId: Maybe<number>,
    payload: Map<any, any>,
    onError: () => void
) => async (dispatch: StoreDispatch) => {
    try {
        dispatch(setLoading(true, 'Creating draft order...'))

        const api = new GorgiasApi()
        const [draftOrder, pollingConfig] = await api.createDraftOrder(
            integrationId,
            payload,
            orderId
        )
        const draftOrderId = draftOrder.get('id')

        shopifyLocalStorage.draftOrders.setMapItem(
            draftOrderId,
            moment().format()
        )
        dispatch(setDraftOrder(draftOrder))

        return pollingConfig
            ? dispatch(
                  pollDraftOrder(integrationId, draftOrderId, pollingConfig)
              )
            : dispatch(setLoading(false))
    } catch (error) {
        console.error(error)
        onError()
        return dispatch(onApiError(error, 'Error while creating draft order'))
    }
}

export const onApiError = (
    error: AxiosError<{error?: {msg: string}}>,
    defaultMessage: string
) => (dispatch: StoreDispatch) => {
    const message =
        error.response && error.response.data && error.response.data.error
            ? error.response.data.error.msg
            : null

    dispatch(setLoading(false))
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: message || defaultMessage,
            allowHTML: true,
        })
    )
}

/* eslint-disable @typescript-eslint/no-misused-promises */
export const pollDraftOrder = (
    integrationId: number,
    draftOrderId: number,
    pollingConfig: PollingConfig
) => async (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                const api = getPollApi()
                api.cancelPendingRequests(true)

                const [draftOrder, pollingConfig] = await api.getDraftOrder(
                    integrationId,
                    draftOrderId
                )
                dispatch(setDraftOrder(draftOrder))

                resolve(
                    pollingConfig
                        ? dispatch(
                              pollDraftOrder(
                                  integrationId,
                                  draftOrderId,
                                  pollingConfig
                              )
                          )
                        : dispatch(setLoading(false))
                )
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }

                console.error(error)
                resolve(
                    dispatch(
                        onApiError(error, 'Error while fetching draft order')
                    )
                )
            }
        }, pollingConfig.retry_after * 1000)
    })
}
/* eslint-enable */

export const loadProducts = async (
    integrationId: number,
    oldOrder: Map<any, any>
): Promise<globalThis.Map<any, any>> => {
    const products = new window.Map()
    const productIds = ((oldOrder.get('line_items', []) as List<any>).map(
        (lineItem: Map<any, any>) => lineItem.get('product_id') as number
    ) as unknown) as number[]
    const api = new GorgiasApi()
    const generator = api.getIntegrationDataItems(
        integrationId,
        IntegrationDataItemType.IntegrationDataItemTypeProduct,
        productIds
    )

    for await (const items of generator) {
        items.forEach((item: Map<any, any>) => {
            products.set(item.getIn(['data', 'id']), item.get('data'))
        })
    }

    return products
}

const getLoadingMessage = (draftOrder: Map<any, any>) =>
    draftOrder.get('id') ? 'Updating draft order...' : 'Creating draft order...'

export const onPayloadChange = (
    integrationId: number,
    payload: Map<any, any>
) => async (dispatch: StoreDispatch, getState: () => RootState) => {
    const state = getState()
    const draftOrder = getCreateOrderState(state).get('draftOrder') as Map<
        any,
        any
    >
    const loadingMessage = getLoadingMessage(draftOrder)
    const newPayload = refreshAppliedDiscounts(payload)

    dispatch(setPayload(newPayload))
    dispatch(setLoading(true, loadingMessage))

    return upsertDraftOrder(integrationId, dispatch, getState)
}

export const upsertDraftOrder = _debounce(
    async (
        integrationId: number,
        dispatch: StoreDispatch,
        getState: () => RootState
    ) => {
        try {
            const state = getState()
            const draftOrder = getCreateOrderState(state).get(
                'draftOrder'
            ) as Map<any, any>
            const payload = getCreateOrderState(state).get('payload') as Map<
                any,
                any
            >
            const loadingMessage = getLoadingMessage(draftOrder)
            const draftOrderId = draftOrder.get('id')

            dispatch(setLoading(true, loadingMessage))

            const api = getUpdateApi()
            api.cancelPendingRequests(true)

            const [newDraftOrder, pollingConfig] = await api.upsertDraftOrder(
                integrationId,
                payload,
                draftOrderId
            )
            const newDraftOrderId = newDraftOrder.get('id')
            dispatch(setDraftOrder(newDraftOrder))

            if (draftOrderId !== newDraftOrderId) {
                shopifyLocalStorage.draftOrders.setMapItem(
                    newDraftOrderId,
                    moment().format()
                )
            }

            return pollingConfig
                ? dispatch(
                      pollDraftOrder(
                          integrationId,
                          newDraftOrderId,
                          pollingConfig
                      )
                  )
                : dispatch(setLoading(false))
        } catch (error) {
            if (axios.isCancel(error)) {
                return
            }

            const state = getState()
            const draftOrder = getCreateOrderState(state).get(
                'draftOrder'
            ) as Map<any, any>
            const draftOrderId = draftOrder.get('id') as number
            const defaultErrorMessage = draftOrderId
                ? 'Error while updating draft order'
                : 'Error while creating draft order'

            console.error(error)
            return dispatch(onApiError(error, defaultErrorMessage))
        }
    },
    500
)

export const addRow = (
    actionName: string,
    integrationId: number,
    product: Product,
    variant: Variant
) => (dispatch: StoreDispatch, getState: () => RootState) => {
    const state = getState()
    const payload = getCreateOrderState(state).get('payload') as Map<any, any>
    const products = getCreateOrderState(state).get(
        'products'
    ) as globalThis.Map<any, any>
    const newPayload = addVariant(payload, product, variant)
    const newProducts = new window.Map(products)

    if (!newProducts.has(product.id)) {
        newProducts.set(product.id, fromJS(product))
    }

    const eventName =
        actionName === ShopifyActionType.CreateOrder
            ? SegmentEvent.ShopifyCreateOrderLineItemAdded
            : SegmentEvent.ShopifyDuplicateOrderLineItemAdded

    segmentTracker.logEvent(eventName, {
        productId: product.id,
        variantId: variant.id,
    })

    return Promise.all([
        dispatch(onPayloadChange(integrationId, newPayload)),
        dispatch(setProducts(newProducts)),
    ])
}

export const addCustomRow = (
    integrationId: number,
    lineItem: Map<any, any>
) => (dispatch: StoreDispatch, getState: () => RootState) => {
    const state = getState()
    const payload = getCreateOrderState(state).get('payload') as Map<any, any>
    const newPayload = addCustomLineItem(payload, lineItem) as Map<any, any>

    return dispatch(onPayloadChange(integrationId, newPayload))
}

export const onCancel = (
    actionName: string,
    integrationId: number,
    via: string
) => async (dispatch: StoreDispatch, getState: () => RootState) => {
    getPollApi().cancelPendingRequests()
    getUpdateApi().cancelPendingRequests()
    upsertDraftOrder.cancel()
    _apiInstances = {}

    const state = getState()
    const draftOrder = getCreateOrderState(state).get('draftOrder') as Map<
        any,
        any
    >

    if (draftOrder) {
        const draftOrderId = draftOrder.get('id') as number
        await deleteTemporaryDraftOrder(integrationId, draftOrderId)
    }

    const eventName =
        actionName === ShopifyActionType.CreateOrder
            ? SegmentEvent.ShopifyCreateOrderCancel
            : SegmentEvent.ShopifyDuplicateOrderCancel

    segmentTracker.logEvent(eventName, {via})
}

export const onSubmitCleanUp = () => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    const state = getState()
    const draftOrder = getCreateOrderState(state).get('draftOrder') as Map<
        any,
        any
    >
    const id = draftOrder.get('id') as number
    shopifyLocalStorage.draftOrders.deleteMapItem(id)
}

export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250
)

export const onEmailInvoice = (
    integrationId: number,
    customerId: number,
    orderId: Maybe<number>,
    invoicePayload: Map<any, any>,
    onSuccess: () => void
) => (dispatch: StoreDispatch, getState: () => RootState): Promise<void> => {
    return new Promise((resolve) => {
        dispatch(setLoading(true, 'Sending invoice...'))

        const state = getState()
        const draftOrder = getCreateOrderState(state).get('draftOrder') as Map<
            any,
            any
        >
        const draftOrderId = draftOrder.get('id') as number
        const draftOrderName = draftOrder.get('name') as string

        const payload = {
            order_id: orderId,
            draft_order_id: draftOrderId,
            draft_order_name: draftOrderName,
            draft_order_invoice: invoicePayload.toJS(),
        }

        const callback = (response: AxiosResponse) => {
            setTimeout(() => {
                if (((response.status as unknown) as string) !== 'error') {
                    onSuccess()

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `Draft order ${draftOrderName} created, invoice successfully sent`,
                        })
                    )
                }

                resolve(dispatch(setLoading(false)) as any)
            }, 0)
        }

        shopifyLocalStorage.draftOrders.deleteMapItem(draftOrderId)

        void dispatch(
            executeAction(
                ShopifyActionType.SendDraftOrderInvoice,
                integrationId.toString(),
                customerId.toString(),
                payload,
                callback as any
            )
        )
    })
}
