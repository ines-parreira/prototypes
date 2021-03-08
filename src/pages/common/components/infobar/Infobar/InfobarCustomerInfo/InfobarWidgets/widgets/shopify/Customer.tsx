import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, Map} from 'immutable'

import * as integrationsSelectors from '../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../state/types'
import {IntegrationType} from '../../../../../../../../../models/integration/types'
import logo from '../../../../../../../../../../img/infobar/shopify.svg'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle.js'
import ActionButtonsGroup from '../ActionButtonsGroup.js'
import {CardHeaderDetails} from '../CardHeaderDetails.js'
import {CardHeaderValue} from '../CardHeaderValue.js'
import {CardHeaderTitle} from '../CardHeaderTitle.js'
import {CardHeaderIcon} from '../CardHeaderIcon.js'
import ExpandAllButton from '../ExpandAllButton.js'
import {InfobarAction} from '../types'
import MoneyAmount from '../MoneyAmount.js'

import DraftOrderModal from './shared/DraftOrderModal/DraftOrderModal'
import {ShopifyActionType} from './types'

export default function Customer() {
    return {
        editionHiddenFields: ['link'],
        TitleWrapper,
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<any, any>
}

class AfterTitleContainer extends Component<
    AfterTitleProps & ConnectedProps<typeof connector>
> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source, integrations} = this.props

        const actions: Array<InfobarAction> = [
            {
                key: 'createOrder',
                options: [
                    {
                        value: ShopifyActionType.CreateOrder,
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
                        <i className="material-icons mr-2">add</i> Create order
                    </>
                ),
                modal: DraftOrderModal,
                modalData: {
                    actionName: ShopifyActionType.CreateOrder,
                    customer: fromJS({
                        id: source.get('id'),
                        admin_graphql_api_id: source.get(
                            'admin_graphql_api_id'
                        ),
                        email: source.get('email'),
                        default_address: source.get('default_address'),
                        currency: source.get('currency'),
                    }),
                },
            },
        ]

        const shopName: string = (this.context as {
            integration: Map<any, any>
        }).integration.getIn(['meta', 'shop_name'])
        const payload = {
            customer_id: source.get('id'),
        }

        return (
            <>
                <ActionButtonsGroup actions={actions} payload={payload} />
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

const connector = connect((state: RootState) => ({
    integrations: integrationsSelectors.getIntegrationsByTypes([
        IntegrationType.ShopifyIntegrationType,
    ])(state),
}))

const AfterTitle = connector(AfterTitleContainer)

type TitleWrapperProps = {
    children: ReactNode
    source: Map<any, any>
}

class TitleWrapper extends Component<TitleWrapperProps> {
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName: string = (this.context as {
            integration: Map<any, any>
        }).integration.getIn(['meta', 'shop_name'])
        const href = `https://${shopName}.myshopify.com/admin/customers/${(
            (source.get('id') as string) || ''
        ).toString()}`

        return (
            <>
                <CardHeaderIcon src={logo} alt="Shopify" />
                <CardHeaderTitle>Shopify</CardHeaderTitle>
                <CardHeaderSubtitle>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </CardHeaderSubtitle>
                <ExpandAllButton />
            </>
        )
    }
}
