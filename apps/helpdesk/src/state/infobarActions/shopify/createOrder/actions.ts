import { logEvent, SegmentEvent } from '@repo/logging'
import type { AxiosResponse } from 'axios'
import { isCancel } from 'axios'
import { fromJS, List } from 'immutable'
import type { Map } from 'immutable'
import _debounce from 'lodash/debounce'

import { getCalculateDraftOrderPayload } from 'business/shopify/calculatedDraftOrder'
import {
    getDiscountAmount,
    refreshAppliedDiscounts,
} from 'business/shopify/discount'
import {
    addCustomLineItem,
    addVariant,
    initDraftOrderPayload,
} from 'business/shopify/draftOrder'
import { getDraftOrderTotalLineItemsPrice } from 'business/shopify/lineItem'
import { formatPercentage, formatPrice } from 'business/shopify/number'
import type {
    AppliedDiscount,
    Product,
    Variant,
} from 'constants/integrations/types/shopify'
import { DiscountType } from 'constants/integrations/types/shopify'
import GorgiasApi from 'services/gorgiasApi'
import { executeAction } from 'state/infobar/actions'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { onApiError } from 'state/utils'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import {
    SET_CALCULATED_DRAFT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS,
} from './constants'
import { getCreateOrderState } from './selectors'

let _apiInstances: { [key: string]: GorgiasApi } = {}

const getApiInstance = (key: string) => () => {
    if (!_apiInstances[key]) {
        _apiInstances[key] = new GorgiasApi()
    }

    return _apiInstances[key]
}

const getCalculateApi = getApiInstance('calculate')

const setLoading = (loading: boolean, message: Maybe<string> = null) => ({
    type: SET_LOADING,
    loading,
    message,
})

const setPayload = (payload: Map<any, any>) => ({
    type: SET_PAYLOAD,
    payload,
})

const setCalculatedDraftOrder = (calculatedDraftOrder: Map<any, any>) => ({
    type: SET_CALCULATED_DRAFT_ORDER,
    calculatedDraftOrder,
})

const setProducts = (products: globalThis.Map<any, any>) => ({
    type: SET_PRODUCTS,
    products,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

export const getDuplicateOrderPayload = (
    payload: Map<any, any>,
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
              formatPrice(0, currency),
          )
        : null

    return payload
        .set('applied_discount', appliedDiscount)
        .set('shipping_line', shippingLine)
}

export const onInit =
    (
        integrationId: number,
        order: Maybe<Map<any, any>>,
        customer: Map<any, any>,
        currencyCode: string,
        onError: () => void,
    ) =>
    async (dispatch: StoreDispatch) => {
        // Duplicate existing order:
        if (order) {
            dispatch(setLoading(true, 'Fetching products...'))

            const products = await loadProducts(integrationId, order)
            const draftOrderPayload = initDraftOrderPayload(
                customer,
                order,
                products as any,
                false,
            )
            const payload = getDuplicateOrderPayload(draftOrderPayload)
            return Promise.all([
                dispatch(setPayload(payload)),
                dispatch(calculateDraftOrder(integrationId, payload, onError)),
                dispatch(setProducts(products)),
            ])
        }

        // Create order from scratch:
        let payload = initDraftOrderPayload(customer)

        if (!payload.get('currency')) {
            payload = payload.set('currency', currencyCode)
        }

        return dispatch(setPayload(payload))
    }

export const calculateDraftOrder =
    (integrationId: number, payload: Map<any, any>, onError?: () => void) =>
    async (dispatch: StoreDispatch) => {
        try {
            const api = getCalculateApi()
            api.cancelPendingRequests(true)

            dispatch(setLoading(true, 'Calculating draft order...'))
            dispatch(setCalculatedDraftOrder(fromJS({})))

            const calculatePayload = getCalculateDraftOrderPayload(payload)
            const calculatedDraftOrder = await api.calculateDraftOrder(
                integrationId,
                calculatePayload,
            )

            dispatch(setCalculatedDraftOrder(calculatedDraftOrder))
        } catch (error) {
            if (isCancel(error)) {
                return
            }

            console.error(error)
            onError && onError()
            dispatch(
                onApiError(
                    error,
                    'Error while calculating draft order',
                    setLoading(false),
                ),
            )
        } finally {
            dispatch(setLoading(false))
        }
    }

export const loadProducts = async (
    integrationId: number,
    oldOrder: Map<any, any>,
): Promise<globalThis.Map<string, any>> => {
    const products = new window.Map()
    const productIds = (oldOrder.get('line_items', []) as List<any>).map(
        (lineItem: Map<any, any>) => lineItem.get('product_id') as number,
    ) as unknown as number[]

    const integrationProducts = await fetchIntegrationProducts(
        integrationId,
        productIds,
    )

    integrationProducts.forEach((item: Map<string, any>) => {
        products.set(item.get('id'), item)
    })

    return products
}

export const onPayloadChange =
    (
        integrationId: number,
        payload: Map<any, any>,
        shouldCalculate: Maybe<boolean> = true,
    ) =>
    (dispatch: StoreDispatch) => {
        const newPayload = refreshAppliedDiscounts(payload)
        dispatch(setPayload(newPayload))

        return shouldCalculate
            ? dispatch(calculateDraftOrder(integrationId, newPayload))
            : null
    }

export const addRow =
    (
        actionName: string,
        integrationId: number,
        product: Product,
        variant: Variant,
    ) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const payload = getCreateOrderState(state).get('payload') as Map<
            any,
            any
        >
        const products = getCreateOrderState(state).get(
            'products',
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

        logEvent(eventName, {
            productId: product.id,
            variantId: variant.id,
        })

        return Promise.all([
            dispatch(onPayloadChange(integrationId, newPayload)),
            dispatch(setProducts(newProducts)),
        ])
    }

export const onLineItemChange =
    (
        integrationId: number,
        {
            newLineItem,
            index,
            remove = false,
        }: { newLineItem?: Map<any, any>; index: number; remove?: boolean },
    ) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const oldPayload = getCreateOrderState(state).get('payload') as Map<
            any,
            any
        >
        const oldLineItems = oldPayload.get('line_items') as List<Map<any, any>>
        let newLineItems: List<Map<any, any>> = List([])
        if (remove) {
            newLineItems = oldLineItems.remove(index)
        } else {
            if (newLineItem) {
                newLineItems = oldLineItems.set(index, newLineItem)
            }
        }
        return dispatch(
            onPayloadChange(
                integrationId,
                oldPayload.set('line_items', newLineItems),
            ),
        )
    }

export const addCustomRow =
    (integrationId: number, lineItem: Map<any, any>) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const payload = getCreateOrderState(state).get('payload') as Map<
            any,
            any
        >
        const newPayload = addCustomLineItem(payload, lineItem)

        return dispatch(onPayloadChange(integrationId, newPayload))
    }

export const onCreateDraftOrder =
    (integrationId: number, orderId?: Maybe<number>) =>
    async (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<Maybe<Map<any, any>>> => {
        try {
            dispatch(setLoading(true, 'Creating draft order...'))

            const state = getState()
            const payload: Map<any, any> =
                getCreateOrderState(state).get('payload')
            const api = new GorgiasApi()
            const [draftOrder] = await api.createDraftOrder(
                integrationId,
                payload,
                orderId,
            )

            return draftOrder
        } catch (error) {
            console.error(error)
            dispatch(
                onApiError(
                    error,
                    'Error while creating draft order',
                    setLoading(false),
                ),
            )
        } finally {
            dispatch(setLoading(false))
        }
    }

export const onCancel =
    (actionName: string, integrationId: number, via: string) => () => {
        getCalculateApi().cancelPendingRequests()
        _apiInstances = {}

        const eventName =
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderCancel
                : SegmentEvent.ShopifyDuplicateOrderCancel

        logEvent(eventName, { via })
    }

export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250,
)

export const sendInvoice =
    (
        integrationId: number,
        customerId: number,
        orderId: Maybe<number>,
        draftOrder: Map<any, any>,
        invoicePayload: Map<any, any>,
        onSuccess: () => void,
    ) =>
    (dispatch: StoreDispatch) => {
        return new Promise((resolve) => {
            dispatch(setLoading(true, 'Sending invoice...'))

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
                    if ((response.status as unknown as string) !== 'error') {
                        onSuccess()

                        void dispatch(
                            notify({
                                status: NotificationStatus.Success,
                                message: `Draft order ${draftOrderName} created, invoice successfully sent`,
                            }),
                        )
                    }

                    resolve(dispatch(setLoading(false)) as any)
                }, 0)
            }

            dispatch(
                executeAction({
                    actionName: ShopifyActionType.SendDraftOrderInvoice,
                    integrationId: integrationId,
                    customerId: customerId.toString(),
                    payload,
                    callback: callback as any,
                }),
            )
        })
    }

export const onEmailInvoice =
    (
        integrationId: number,
        customerId: number,
        orderId: Maybe<number>,
        invoicePayload: Map<any, any>,
        onSuccess: () => void,
    ) =>
    async (dispatch: StoreDispatch): Promise<any> => {
        const draftOrder = await dispatch(
            onCreateDraftOrder(integrationId, orderId),
        )

        if (!draftOrder) {
            return
        }

        return dispatch(
            sendInvoice(
                integrationId,
                customerId,
                orderId,
                draftOrder,
                invoicePayload,
                onSuccess,
            ),
        )
    }
