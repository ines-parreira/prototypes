import React, {Component, ContextType, ReactNode, useContext} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'

import logo from 'assets/img/infobar/shopify.svg'
import {logEvent, SegmentEvent} from 'common/segment'
import {RootState} from 'state/types'
import useAppSelector from 'hooks/useAppSelector'
import * as integrationsSelectors from 'state/integrations/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import StaticField from 'Infobar/features/Field/components/StaticField'
import {CardHeaderSubtitle} from 'Infobar/features/Card/display/CardHeaderSubtitle'
import {CardHeaderTitle} from 'Infobar/features/Card/display/CardHeaderTitle'
import {CardHeaderIcon} from 'Infobar/features/Card/display/CardHeaderIcon'
import ExpandAllButton from 'Infobar/features/Card/display/ExpandAllButton'

import {shopifyAdminBaseUrl} from 'config/integrations/shopify'
import ActionButtonsGroup from '../ActionButtonsGroup'
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
                <StaticField label="Total spent">
                    <MoneyAmount
                        amount={source.get('total_spent')}
                        currencyCode={this.context.integration.getIn([
                            'meta',
                            'currency',
                        ])}
                    />
                </StaticField>
                <StaticField label="Orders">
                    {source.get('orders_count')}
                </StaticField>
                {integrations.length > 1 && (
                    <StaticField label="Store">{shopName}</StaticField>
                )}
            </>
        )
    }
}

const connector = connect((state: RootState) => ({
    integrations:
        integrationsSelectors.getIntegrationsByType<ShopifyIntegration>(
            IntegrationType.Shopify
        )(state),
}))

const AfterTitle = connector(AfterTitleContainer)

type TitleWrapperProps = {
    children: ReactNode
    source: Map<any, any>
    isEditing: boolean
}

function TitleWrapper({children, source, isEditing}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const shopName: string = integration.getIn(['meta', 'shop_name'])
    const href = `${shopifyAdminBaseUrl(shopName)}/customers/${(
        (source.get('id') as string) || ''
    ).toString()}`

    return (
        <>
            {!isEditing && <ExpandAllButton />}
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="Shopify" />
                Shopify
                <CardHeaderSubtitle>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            logEvent(SegmentEvent.ShopifyProfileClicked, {
                                account_domain: currentAccount.get('domain'),
                            })
                        }}
                    >
                        {children}
                    </a>
                </CardHeaderSubtitle>
            </CardHeaderTitle>
        </>
    )
}
