import React, {ReactNode, useContext} from 'react'
import {Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import logo from 'assets/img/infobar/bigcommerce.svg'
import {logEvent, SegmentEvent} from 'common/segment'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    BigCommerceActionType,
    BigCommerceCustomer,
} from 'models/integration/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import StaticField from 'infobar/components/StaticField'
import {CardHeaderTitle} from 'infobar/ui/Card/CardHeaderTitle'
import {CardHeaderIcon} from 'infobar/ui/Card/CardHeaderIcon'
import ExpandAllButton from 'infobar/ui/ExpandAllButton'
import {CardHeaderSubtitle} from 'infobar/ui/Card/CardHeaderSubtitle'

import ActionButtonsGroup from '../ActionButtonsGroup'
import {InfobarAction} from '../types'
import OrderModal from './AddOrderModal/OrderModal'

export default function Customer() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

type AfterTitleProps = {
    children?: ReactNode
    source: Map<any, any>
}

function AfterTitle({source}: AfterTitleProps) {
    const {integration} = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'shop_display_name']) as string

    const bigCommerceCustomer: BigCommerceCustomer = {
        id: source.get('id'),
        email: source.get('email'),
    }

    let actions: Array<InfobarAction> = []
    const bigcommerceCreateOrderAccessFlags =
        useFlags()[FeatureFlagKey.BigCommerceCreateOrder]
    if (bigcommerceCreateOrderAccessFlags) {
        actions = [
            {
                key: 'createOrder',
                options: [
                    {
                        value: BigCommerceActionType.CreateOrder,
                        label: 'Create order',
                        parameters: [{name: 'cart_id', type: 'hidden'}],
                    },
                ],
                title: 'Create order',
                child: (
                    <>
                        <ButtonIconLabel icon="add" /> Create order
                    </>
                ),
                modal: OrderModal,
                modalData: {
                    actionName: BigCommerceActionType.CreateOrder,
                    customer: bigCommerceCustomer,
                },
            },
        ]
    }
    const payload = {
        customer_id: source.get('id'),
    }
    return (
        <>
            {actions && (
                <ActionButtonsGroup actions={actions} payload={payload} />
            )}
            <StaticField label="Store">{storeName}</StaticField>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    isEditing?: boolean
}

export function TitleWrapper({children, source, isEditing}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const storeHash = integration.getIn(['meta', 'store_hash']) as string
    const customerId = (source.get('id') || '') as string
    let customerLink = ''
    if (customerId) {
        customerLink = `https://store-${storeHash}.mybigcommerce.com/manage/customers/${customerId}/edit`
    }
    return (
        <>
            {!isEditing && <ExpandAllButton />}
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="BigCommerce" />
                BigCommerce
                <CardHeaderSubtitle>
                    <a
                        href={customerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            logEvent(SegmentEvent.BigCommerceProfileClicked, {
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
