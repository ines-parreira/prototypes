import React, {ReactNode, useContext} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/infobar/bigcommerce.svg'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {StaticField} from '../StaticField'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

export default function Customer() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

function AfterTitle() {
    const {integration} = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'shop_display_name']) as string

    return (
        <>
            <StaticField label="Store">{storeName}</StaticField>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}

export function TitleWrapper({children, source}: TitleWrapperProps) {
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
            <ExpandAllButton />
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
