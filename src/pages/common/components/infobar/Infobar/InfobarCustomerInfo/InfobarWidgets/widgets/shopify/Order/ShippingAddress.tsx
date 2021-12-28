import React, {useContext, useMemo} from 'react'
import {Map} from 'immutable'

import ActionButtonsGroup from '../../ActionButtonsGroup'
import {InfobarAction} from '../../types'
import {ShopifyActionType} from '../types'
import {WidgetContext} from '../../../WidgetContext'

import EditOrderShippingAddressModal from './EditOrderShippingAddressModal/EditOrderShippingAddressModal'

export default function ShippingAddress() {
    return {
        AfterTitle,
        editionHiddenFields: ['link'],
    }
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

export function AfterTitle({source}: AfterTitleProps) {
    const {widget_resource_ids} = useContext(WidgetContext)
    const payload = useMemo(() => {
        return {order_id: widget_resource_ids.target_id}
    }, [widget_resource_ids])

    const _getActions = () => {
        const actions: Array<InfobarAction> = [
            {
                key: 'edit',
                options: [
                    {
                        value: ShopifyActionType.EditShippingAddress,
                        label: 'Edit Address',
                        parameters: [
                            {name: 'order_id', type: 'hidden'},
                            {name: 'payload', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Edit Address',
                child: (
                    <>
                        <i className="material-icons">mode_edit</i> Edit
                    </>
                ),
                modal: EditOrderShippingAddressModal,
                modalData: {
                    actionName: ShopifyActionType.EditShippingAddress,
                    customer_id: widget_resource_ids.customer_id,
                    order_id: widget_resource_ids.target_id,
                    current_shipping_address: source,
                },
            },
        ]
        return actions
    }

    return <ActionButtonsGroup actions={_getActions()} payload={payload} />
}
