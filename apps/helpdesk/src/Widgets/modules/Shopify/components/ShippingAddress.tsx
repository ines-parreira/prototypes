import React, { useContext, useMemo } from 'react'

import { Map } from 'immutable'

import ActionButtonsGroup from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup'
import { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import { EditOrderShippingAddressModal } from 'Widgets/modules/Shopify/modules/Order'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'
import { CardCustomization } from 'Widgets/modules/Template/modules/Card'

import { CustomizationContext } from '../../Template'
import { ShopifyContext } from '../contexts/ShopifyContext'

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

const AfterTitle = ({ source }: AfterTitleProps) => {
    const { widget_resource_ids } = useContext(ShopifyContext)
    const { hideActionsForCustomer = false } =
        useContext(CustomizationContext) || {}

    const payload = useMemo(() => {
        return { order_id: widget_resource_ids.target_id }
    }, [widget_resource_ids])

    const getActions = () => {
        if (hideActionsForCustomer) {
            return []
        }

        const actions: Array<InfobarAction> = [
            {
                key: 'edit',
                options: [
                    {
                        value: ShopifyActionType.EditShippingAddress,
                        label: 'Edit Address',
                        parameters: [
                            { name: 'order_id', type: 'hidden' },
                            { name: 'payload', type: 'hidden' },
                        ],
                    },
                ],
                title: 'Edit Address',
                child: <>Edit</>,
                leadingIcon: 'mode_edit',
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

    return <ActionButtonsGroup actions={getActions()} payload={payload} />
}

export const shippingAddressCustomization: CardCustomization = {
    AfterTitle,
    editionHiddenFields: ['link'],
}
