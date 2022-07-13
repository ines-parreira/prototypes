import React, {ReactNode, useContext} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/infobar/bigcommerce.svg'

import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import {IntegrationContext} from '../IntegrationContext'

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
            <CardHeaderDetails>
                <CardHeaderValue label="Store">{storeName}</CardHeaderValue>
            </CardHeaderDetails>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}

export function TitleWrapper({children, source}: TitleWrapperProps) {
    const {integration} = useContext(IntegrationContext)
    const storeHash = integration.getIn(['meta', 'store_hash']) as string
    const customerId = (source.get('id') || '') as string
    const customerLink = `https://store-${storeHash}.mybigcommerce.com/manage/customers/${customerId}/edit`

    return (
        <>
            <CardHeaderIcon src={logo} alt="BigCommerce" />
            <CardHeaderTitle>BigCommerce</CardHeaderTitle>
            <CardHeaderSubtitle>
                <a
                    href={customerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            </CardHeaderSubtitle>
            <ExpandAllButton />
        </>
    )
}
