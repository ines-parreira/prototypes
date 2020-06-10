// @flow
import React from 'react'
import {connect} from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, type List, type Map} from 'immutable'

import * as integrationsSelectors from '../../../../../../../../../state/integrations/selectors'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../constants/integration'
import logo from '../../../../../../../../../../img/infobar/shopify.svg'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import type {ActionType} from '../types'
import MoneyAmount from '../MoneyAmount'

import DraftOrderModal from './shared/DraftOrderModal'
import {ShopifyAction} from './constants'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<string, *>,
    integrations: List<*>,
}

@connect((state) => ({
    integrations: integrationsSelectors.getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state),
}))
class AfterTitle extends React.Component<AfterTitleProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source, integrations} = this.props

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
                    <>
                        <i className="material-icons mr-2">
                            add
                        </i>
                        Create order
                    </>
                ),
                modal: DraftOrderModal,
                modalData: {
                    actionName: ShopifyAction.CREATE_ORDER,
                    customer: fromJS({
                        id: source.get('id'),
                        email: source.get('email'),
                        default_address: source.get('default_address'),
                        currency: source.get('currency'),
                    }),
                },
            },
        ]

        const shopName: string = this.context.integration.getIn(['meta', 'shop_name'])
        const payload = {
            customer_id: source.get('id')
        }

        return (
            <>
                <ActionButtonsGroup
                    actions={actions}
                    payload={payload}
                />
                <CardHeaderDetails>
                    <CardHeaderValue label="Total spent">
                        <MoneyAmount
                            amount={source.get('total_spent')}
                            currencyCode={source.get('currency')}
                        />
                    </CardHeaderValue>
                    <CardHeaderValue label="Orders">
                        {source.get('orders_count')}
                    </CardHeaderValue>
                    {integrations.size > 1 && (
                        <CardHeaderValue label="Store">
                            {shopName}
                        </CardHeaderValue>
                    )}
                </CardHeaderDetails>
            </>
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
        const href = `https://${shopName}.myshopify.com/admin/customers/${(source.get('id') || '').toString()}`

        return (
            <>
                <CardHeaderIcon
                    src={logo}
                    alt="Shopify"
                />
                <CardHeaderTitle>Shopify</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                </CardHeaderSubtitle>
                <ExpandAllButton/>
            </>
        )
    }
}
