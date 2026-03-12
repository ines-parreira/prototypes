import { logEvent, SegmentEvent } from '@repo/logging'
import { isCancel } from 'axios'
import type { Map } from 'immutable'
import { fromJS, List } from 'immutable'
import _debounce from 'lodash/debounce'

import { calculateEditDiff } from 'business/shopify/calculatedEditOrder'
import { refreshAppliedDiscounts } from 'business/shopify/discount'
import {
    addCustomLineItem,
    addVariant,
    initDraftOrderPayload,
} from 'business/shopify/draftOrder'
import type { Product, Variant } from 'constants/integrations/types/shopify'
import { EditOrderAction } from 'constants/integrations/types/shopify'
import GorgiasApi from 'services/gorgiasApi'
import { fetchIntegrationProducts } from 'state/integrations/helpers'
import type { RootState, StoreDispatch } from 'state/types'
import { onApiError } from 'state/utils'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import {
    SET_CALCULATED_EDIT_ORDER,
    SET_INITIAL_STATE,
    SET_LOADING,
    SET_PAYLOAD,
    SET_PRODUCTS,
} from './constants'
import { getEditOrderState } from './selectors'

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

const setCalculatedEditOrder = (calculatedEditOrder: Map<any, any>) => ({
    type: SET_CALCULATED_EDIT_ORDER,
    calculatedEditOrder,
})

const setProducts = (products: globalThis.Map<any, any>) => ({
    type: SET_PRODUCTS,
    products,
})

const setInitialState = () => ({
    type: SET_INITIAL_STATE,
})

/**
 * Function called when the edit order modal is opened,
 * call the Shopify API to get the edit order transaction Id and cart infos and update the state
 * @param {Number} integrationId - The id of the integration
 * @param {Object} order - The entire order infos
 * @param {Object} customer - The entire customer infos
 * @param {String} currencyCode - Current currency used by the Shopify shop
 * @returns {Promise} Return Promise when state is updated and edit order is ready
 */
export const onInit =
    (
        integrationId: number,
        order: Maybe<Map<any, any>>,
        customer: Map<any, any>,
        currencyCode: string,
        onError: () => void,
    ) =>
    async (dispatch: StoreDispatch) => {
        // Create payload as if we wanted to duplicate the order
        if (order) {
            dispatch(setLoading(true, 'Fetching products...'))
            const products = await loadProducts(integrationId, order)

            //get the edit order payload with all line_items and products
            const payload = initDraftOrderPayload(
                customer,
                order,
                products as any,
                true,
            )
            const clean_payload = _cleanInitPayload(payload)
            return Promise.all([
                dispatch(setPayload(clean_payload)),
                dispatch(
                    _initEditOrder(
                        integrationId,
                        order.get('admin_graphql_api_id'),
                        onError,
                    ),
                ),
                dispatch(setProducts(products)),
            ])
        }
    }

/**
 * Call the Shopify API to get the order transaction Id
 * @param {Number} integrationId - Integration id of the current integration
 * @param {String} orderId - Order id of current edited order
 * @param {Function} onError - Function to call in case an error occurred while calling the API
 * @returns {Promise} Promise during which the state is set with the current edit order details (transaction id)
 */
const _initEditOrder =
    (integrationId: number, orderId: string, onError?: () => void) =>
    async (dispatch: StoreDispatch) => {
        try {
            const api = getCalculateApi()
            api.cancelPendingRequests(true)

            dispatch(setLoading(true, 'Calculating edit order...'))

            const beginEditOrder = await api.beginEditOrder(
                integrationId,
                fromJS({ orderId: orderId }),
            )
            const calculatedEditOrder = _initEditOrderPayload(beginEditOrder)
            dispatch(setCalculatedEditOrder(calculatedEditOrder))
        } catch (error) {
            if (isCancel(error)) {
                return
            }
            onError && onError()
            dispatch(
                onApiError(
                    error,
                    'Error while beginning edit order',
                    setLoading(false),
                ),
            )
        } finally {
            dispatch(setLoading(false))
        }
    }

/**
 * Init the order payload to store the calculated order id and all payment infos
 * @param {Object} beginOrder - Json payload returned by Shopify beginOrder GraphQl query
 * @returns {Object} the infos on the price and the transaction order Id
 */
const _initEditOrderPayload = (beginOrder: Map<any, any>) => {
    return fromJS({
        calculatedOrderId: beginOrder.get('id'),
        total_line_items_price: beginOrder.getIn([
            'originalOrder',
            'subtotalPriceSet',
            'presentmentMoney',
            'amount',
        ]),
        current_total_tax: beginOrder.getIn([
            'originalOrder',
            'totalTaxSet',
            'presentmentMoney',
            'amount',
        ]),
        current_total_price: beginOrder.getIn([
            'originalOrder',
            'totalPriceSet',
            'presentmentMoney',
            'amount',
        ]),
        paid_by_customer: beginOrder.getIn([
            'originalOrder',
            'totalReceivedSet',
            'presentmentMoney',
            'amount',
        ]),
        amount_to_collect: beginOrder.getIn([
            'originalOrder',
            'totalOutstandingSet',
            'presentmentMoney',
            'amount',
        ]),
    }) as Map<any, any>
}

const _cleanInitPayload = (payload: Map<any, any>) => {
    const linesWithQty = [] as Array<Map<any, any>>
    const lineItems = payload.get('line_items') as List<Map<any, any>>
    lineItems.forEach((lineItem) => {
        if (lineItem && lineItem.get('initial_quantity'))
            linesWithQty.push(lineItem)
    })

    return payload.set('line_items', fromJS(linesWithQty))
}

/**
 * Init the order payload to store the calculated order id and all payment infos
 * @param {Object} beginOrder - Json payload returned by Shopify beginOrder GraphQl query
 * @returns {Object} the infos on the price and the transaction order Id
 */
const _refreshOrderAmount =
    (calculatedOrder: Map<any, any>, editedOrder: Map<any, any>) =>
    (dispatch: StoreDispatch) => {
        const taxLines = editedOrder.get('taxLines') as List<Map<any, any>>
        const changeList = editedOrder.getIn([
            'stagedChanges',
            'edges',
        ]) as List<Map<any, any>>

        const updatedOrder = fromJS({
            calculatedOrderId: calculatedOrder.get('calculatedOrderId'),
            total_line_items_price: editedOrder.getIn([
                'subtotalPriceSet',
                'presentmentMoney',
                'amount',
            ]),
            current_total_tax: taxLines
                ?.last()
                ?.getIn(['priceSet', 'presentmentMoney', 'amount']),
            current_total_price: editedOrder.getIn([
                'totalPriceSet',
                'presentmentMoney',
                'amount',
            ]),
            paid_by_customer: calculatedOrder.get('paid_by_customer'),
            amount_to_collect: editedOrder.getIn([
                'totalOutstandingSet',
                'presentmentMoney',
                'amount',
            ]),
            has_changes: changeList.size !== 0,
        })

        dispatch(setCalculatedEditOrder(updatedOrder))
    }

/**
 * Function called when a change is made inside the order
 */
export const onPayloadChange =
    (integrationId: number, payload: Map<any, any>, onError?: () => void) =>
    async (dispatch: StoreDispatch, getState: () => RootState) => {
        try {
            const state = getState()
            const calculatedOrder = getEditOrderState(state).get(
                'calculatedEditOrder',
            ) as Map<any, any>
            const api = getCalculateApi()

            api.cancelPendingRequests(true)

            dispatch(setLoading(true, 'Calculating edit order...'))

            const oldPayload = getEditOrderState(state).get('payload') as Map<
                any,
                any
            >
            //Try to detect the changes made as the Shopify edit order only handles atomic operations
            const updateToPerform = calculateEditDiff(payload, oldPayload)

            if (!updateToPerform || !updateToPerform.action) return

            updateToPerform.calculated_order_id =
                calculatedOrder.get('calculatedOrderId')

            const editedOrder = await api.editOrder(
                integrationId,
                updateToPerform,
            )

            let updatedPayload = payload

            if (
                [
                    EditOrderAction.AddVariant,
                    EditOrderAction.AddCustomVariant,
                    EditOrderAction.ApplyItemDiscount,
                ].findIndex((action) => action === updateToPerform.action) !==
                -1
            ) {
                updatedPayload = _updatePayload(
                    updatedPayload,
                    editedOrder.getIn(['calculatedLineItem']),
                    updateToPerform.action,
                    updateToPerform.variant_id || updateToPerform.line_item_id,
                    updateToPerform.title,
                )
            }

            updatedPayload = refreshAppliedDiscounts(updatedPayload)
            if (!editedOrder || !Object.keys(editedOrder).length) return

            dispatch(
                _refreshOrderAmount(
                    calculatedOrder,
                    editedOrder.get('calculatedOrder'),
                ),
            )
            dispatch(setPayload(updatedPayload))
        } catch (error) {
            if (isCancel(error)) {
                return
            }
            onError && onError()
            dispatch(
                onApiError(
                    error,
                    'Error while calculating edit order',
                    setLoading(false),
                ),
            )
        } finally {
            dispatch(setLoading(false))
        }
    }

/**
 * In case a new discount, variant or custom variant is added we need to save the according transaction Id
 * as Shopify needs this Id to allow quantity / amount changes on those resources
 * @param {Object} payload - Current payload object with all line items and discounts
 * @param {Object} calculatedLineItem - Edited line item return by the Shopify API
 * with the corresponding transaction Id nested
 * @param {String} action - Action performed by the user : added new variant, ...
 * @param {String} lookupId - The edited line item Id or edit discount Id
 * @param {String} title - Title of the custom variant in case of custom variant addition (no variant Id in that case)
 * @returns {Object} the updated payload with all line items, discounts and newly added transaction Id
 */
const _updatePayload = (
    payload: Map<any, any>,
    calculatedLineItem: Map<any, any>,
    action: string,
    lookupId?: string,
    title?: string,
): Map<any, any> => {
    let line_items = payload.get('line_items') as List<Map<any, any>>
    let line_item_index

    //Find corresponding line item in old payload
    if (action === EditOrderAction.AddCustomVariant) {
        line_item_index = line_items.findIndex(
            (lItem) =>
                (lItem &&
                    !lItem.get('variant_admin_graphql_api_id') &&
                    !lItem.get('lineItem_admin_graphql_api_id') &&
                    lItem.get('title')) === title,
        )
    } else if (action === EditOrderAction.ApplyItemDiscount) {
        line_item_index = line_items.findIndex(
            (lItem) =>
                (lItem && lItem.get('lineItem_admin_graphql_api_id')) ===
                lookupId,
        )
    } else {
        line_item_index = line_items.findIndex(
            (lItem) =>
                (lItem && lItem.get('variant_admin_graphql_api_id')) ===
                lookupId,
        )
    }

    if (line_item_index === -1) return payload
    let line_item = line_items.get(line_item_index)

    // insert lineItemId if we added a variant
    if (
        action === EditOrderAction.AddCustomVariant ||
        action === EditOrderAction.AddVariant
    ) {
        line_item = line_items
            .get(line_item_index)
            .set('lineItem_admin_graphql_api_id', calculatedLineItem.get('id'))
    } else if (action === EditOrderAction.ApplyItemDiscount) {
        // add discount id to the line item
        const discountApplications = calculatedLineItem.get(
            'calculatedDiscountAllocations',
        ) as List<Map<any, any>>

        const discountApplicationId = discountApplications
            .last()
            .getIn(['discountApplication', 'id'])
        line_item = line_items
            .get(line_item_index)
            .set(
                'discountApplication_admin_graphql_api_id',
                discountApplicationId,
            )
    }

    line_items = line_items.setIn([line_item_index], line_item)
    return payload.set('line_items', line_items)
}

/**
 * Called with a small debounce each time the order note is changed
 */
export const onNoteChange =
    (payload: Map<any, any>) => (dispatch: StoreDispatch) => {
        dispatch(setPayload(payload))
    }

/**
 * Called with a small debounce each time the notify customer checkbox is clicked
 */
export const onNotifyChange =
    (payload: Map<any, any>) => (dispatch: StoreDispatch) => {
        dispatch(setPayload(payload))
    }

/**
 * Load all available store products
 */
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

/**
 * Add a new lineItem row
 */
export const addRow =
    (
        actionName: string,
        integrationId: number,
        product: Product,
        variant: Variant,
    ) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const payload = getEditOrderState(state).get('payload') as Map<any, any>
        const products = getEditOrderState(state).get(
            'products',
        ) as globalThis.Map<any, any>
        const newPayload = addVariant(payload, product, variant)
        const newProducts = new window.Map(products)

        if (!newProducts.has(product.id)) {
            newProducts.set(product.id, fromJS(product))
        }
        if (actionName !== ShopifyActionType.EditOrder) return
        const eventName = SegmentEvent.ShopifyEditOrderLineItemAdded

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
        const oldPayload = getEditOrderState(state).get('payload') as Map<
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

/**
 * Add a new customItem row
 */
export const addCustomRow =
    (integrationId: number, lineItem: Map<any, any>) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const payload = getEditOrderState(state).get('payload')
        const newPayload = addCustomLineItem(payload, lineItem)

        return dispatch(onPayloadChange(integrationId, newPayload))
    }

/**
 * Called when modal is closed without submitting
 */
export const onCancel =
    (actionName: string, integrationId: number, via: string) => () => {
        getCalculateApi().cancelPendingRequests()
        _apiInstances = {}

        if (actionName !== ShopifyActionType.EditOrder) return
        const eventName = SegmentEvent.ShopifyEditOrderCancel
        logEvent(eventName, { via })
    }

/**
 * Reset the modal state between two modal openings after a small debounce
 */
export const onReset = () => (dispatch: StoreDispatch) => resetState(dispatch)

export const resetState = _debounce(
    (dispatch: StoreDispatch) => dispatch(setInitialState()),
    250,
)
