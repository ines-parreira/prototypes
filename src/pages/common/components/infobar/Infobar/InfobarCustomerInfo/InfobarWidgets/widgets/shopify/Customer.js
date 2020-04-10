// @flow
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'

import ActionButtonsGroup from '../ActionButtonsGroup'
import type {ActionType} from '../types'

import DraftOrderModal from './DraftOrderModal'
import {ShopifyAction} from './constants'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<string, *>
}

class AfterTitle extends React.Component<AfterTitleProps> {
    render() {
        const {source} = this.props

        const actions: Array<ActionType> = [
            // {
            //     key: 'creategiftcard',
            //     options: [{
            //         value: 'shopifyCreateGiftCard',
            //         label: 'Create gift card',
            //         parameters: [{
            //             name: 'value',
            //             type: 'number',
            //             defaultValue: 10.00,
            //             placeholder: 'Value',
            //             required: true,
            //             step: 0.01,
            //             min: 0.01
            //         }, {
            //             name: 'code',
            //             type: 'text',
            //             defaultValue: 'HELLO123' // {{ticket.customer.name}}{{ticket.id}}
            //         }]
            //     }],
            //     title: (
            //         <div>
            //             <i className="material-icons mr-2">
            //                 card_giftcard
            //             </i>
            //             Create gift card
            //         </div>
            //     ),
            //     child: (
            //         <div>
            //             <i className="material-icons mr-2">
            //                 card_giftcard
            //             </i>
            //             Create gift card
            //         </div>
            //     )
            // }
            {
                key: 'createOrder',
                options: [
                    {
                        value: ShopifyAction.CREATE_ORDER,
                        label: 'Create order',
                        parameters: [
                            {name: 'draft_order_id', type: 'hidden'},
                            {name: 'payment_pending', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Create order',
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            add
                        </i>
                        Create order
                    </div>
                ),
                modal: DraftOrderModal,
                modalData: {
                    actionName: ShopifyAction.CREATE_ORDER,
                    customer: fromJS({
                        id: source.get('id'),
                        email: source.get('email'),
                    }),
                },
            },
        ]

        const payload = {
            customer_id: source.get('id')
        }

        return (
            <ActionButtonsGroup
                actions={actions}
                payload={payload}
            />
        )
    }
}


type TitleWrapperProps = {
    children: Object,
    source: Map<string, *>
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName: string = this.context.integration.getIn(['meta', 'shop_name'])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/customers/${(source.get('id') || '').toString()}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}
