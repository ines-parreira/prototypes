import React, {Component, ContextType, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'

import logo from 'assets/img/infobar/shopify.svg'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import * as integrationsSelectors from '../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../state/types'
import {IntegrationType} from '../../../../../../../../../models/integration/types'
import {IntegrationContext} from '../IntegrationContext'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import ActionButtonsGroup from '../ActionButtonsGroup'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {InfobarAction} from '../types'
import MoneyAmount from '../MoneyAmount'

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
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
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
                        <ButtonIconLabel icon="add" /> Create order
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

        const shopName: string = this.context.integration.getIn([
            'meta',
            'shop_name',
        ])
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
                            currencyCode={this.context.integration.getIn([
                                'meta',
                                'currency',
                            ])}
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
        IntegrationType.Shopify,
    ])(state),
}))

const AfterTitle = connector(AfterTitleContainer)

type TitleWrapperProps = {
    children: ReactNode
    source: Map<any, any>
}

class TitleWrapper extends Component<TitleWrapperProps> {
    render() {
        const {children, source} = this.props
        const shopName: string = (
            this.context as {
                integration: Map<any, any>
            }
        ).integration.getIn(['meta', 'shop_name'])
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
TitleWrapper.contextType = IntegrationContext
