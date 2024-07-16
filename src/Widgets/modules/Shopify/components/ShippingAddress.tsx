import React, {useContext, useMemo} from 'react'
import {Map} from 'immutable'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import {InfobarAction} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'
import {EditOrderShippingAddressModal} from 'Widgets/modules/Shopify/modules/Order'
import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

import {ShopifyContext} from '../contexts/ShopifyContext'

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

export function AfterTitle({source}: AfterTitleProps) {
    const {widget_resource_ids} = useContext(ShopifyContext)
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
                        <ButtonIconLabel icon="mode_edit" /> Edit
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

export const shippingAddressCustomization: CardCustomization = {
    AfterTitle,
    editionHiddenFields: ['link'],
}
