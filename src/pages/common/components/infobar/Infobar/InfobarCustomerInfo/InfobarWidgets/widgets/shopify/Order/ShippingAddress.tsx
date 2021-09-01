import React, {useMemo} from 'react'
import {Map} from 'immutable'

import PropTypes from 'prop-types'

import ActionButtonsGroup from '../../ActionButtonsGroup'
import {InfobarAction} from '../../types'
import {ShopifyActionType} from '../types'

import EditOrderShippingAddressModal from './EditOrderShippingAddressModal/EditOrderShippingAddressModal'

export default function ShippingAddress() {
    return {
        AfterTitle,
        editionHiddenFields: ['link'],
    }
}
type Context = {
    integrationId: number
    data_source: string
    widget_resource_ids: IWidgetRessources
}

interface IWidgetRessources {
    target_id: number
    customer_id?: number
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

export function AfterTitle(
    {source}: AfterTitleProps,
    {widget_resource_ids}: Context
) {
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

AfterTitle.contextTypes = {
    integrationId: PropTypes.number.isRequired,
    data_source: PropTypes.string.isRequired,
    widget_resource_ids: PropTypes.object.isRequired,
}
