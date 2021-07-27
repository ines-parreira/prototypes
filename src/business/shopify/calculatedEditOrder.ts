import {fromJS, List, Map} from 'immutable'
import _isEqual from 'lodash/isEqual'

import {
    Edit_to_perform,
    EditOrderAction,
} from '../../constants/integrations/types/shopify'

/*
    Takes the old payload before modification and the one after modification
    Try to find what changed and build a payload with all the required graphQL params to send them to the backend
 */
export function calculateEditDiff(
    newPayload: Map<any, any>,
    oldPayload: Map<any, any>
) {
    const oldList = oldPayload.get('line_items') as List<Map<any, any>>
    const newList = newPayload.get('line_items') as List<Map<any, any>>

    if (!oldList || !newList) return

    const oldListArray = oldList.toArray()
    const newListArray = newList.toArray()

    const editToPerform: Edit_to_perform = {action: '', calculated_order_id: ''}

    //a new variant has been added
    if (oldListArray.length < newListArray.length) {
        //new item is most probably at the end of the newListArray
        for (let i = newListArray.length - 1; i >= 0; i--) {
            const alreadyExists = oldListArray.some((oldVariant) =>
                _isEqual(oldVariant, newListArray[i])
            )

            if (!alreadyExists) {
                if (newListArray[i].get('variant_admin_graphql_api_id')) {
                    editToPerform.action = EditOrderAction.AddVariant
                    editToPerform.variant_id = newListArray[i].get(
                        'variant_admin_graphql_api_id'
                    )
                    editToPerform.quantity = newListArray[i].get('quantity')
                } else {
                    // item is a custom item
                    editToPerform.action = EditOrderAction.AddCustomVariant
                    editToPerform.title = newListArray[i].get('title')
                    editToPerform.quantity = newListArray[i].get('quantity')
                    editToPerform.taxable = newListArray[i].get('taxable')

                    editToPerform.requires_shipping = newListArray[i].get(
                        'requires_shipping'
                    )
                    editToPerform.price = fromJS({
                        amount: newListArray[i].get('price'),
                        currency_code: newPayload.get('currency'),
                    })
                }
                break
            }
        }
    } else if (oldListArray.length > newListArray.length) {
        // a variant has been removed
        editToPerform.action = EditOrderAction.RemoveVariant

        oldListArray.some(function (oldVariant) {
            const index = newListArray.findIndex((newVariant) =>
                _isEqual(oldVariant, newVariant)
            )
            //old item has not been found
            if (index === -1) {
                editToPerform.line_item_id = oldVariant.get(
                    'lineItem_admin_graphql_api_id'
                )
            }
        })
    } else {
        // a variant line has been changed (quantity)
        const changed_item_index = newListArray.findIndex(function (
            newVariant,
            index
        ) {
            return !_isEqual(newVariant, oldListArray[index])
        })

        if (changed_item_index !== -1) {
            const changed_item = newListArray[changed_item_index]

            editToPerform.action = EditOrderAction.ChangeLineItem

            editToPerform.line_item_id = changed_item.get(
                'lineItem_admin_graphql_api_id'
            )
            editToPerform.quantity = changed_item.get('quantity')
            editToPerform.restock = changed_item.get('restock_item') || false

            let quantityIsTheSame = false

            if (
                changed_item.get('quantity') ===
                    oldListArray[changed_item_index].get('quantity') &&
                changed_item.get('newly_added')
            )
                quantityIsTheSame = true

            const applied_discount = changed_item.get(
                'applied_discount'
            ) as Map<any, any>

            // the change was about the item discount
            if (applied_discount && quantityIsTheSame) {
                const discount: {[key: string]: any} = {}

                editToPerform.action = EditOrderAction.ApplyItemDiscount
                discount['description'] = applied_discount.get('title')

                if (applied_discount.get('value_type') === 'fixed_amount') {
                    discount['fixed_value'] = {
                        amount: applied_discount.get('amount'),
                        currency_code: applied_discount.get('currency_code'),
                    }
                } else
                    discount['percent_value'] = parseFloat(
                        applied_discount.get('value')
                    )

                editToPerform.discount = fromJS(discount)
                // the discount has been removed
            } else if (!applied_discount && quantityIsTheSame) {
                editToPerform.action = EditOrderAction.RemoveItemDiscount
                editToPerform.discount_item_id = changed_item.get(
                    'discountApplication_admin_graphql_api_id'
                )
            }
        }
    }
    return editToPerform
}
