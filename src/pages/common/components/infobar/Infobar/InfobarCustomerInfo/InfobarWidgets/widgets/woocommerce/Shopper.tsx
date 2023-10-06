import React, {ReactNode} from 'react'

import {Map} from 'immutable'
import logo from 'assets/img/infobar/woocommerce.svg'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import {useStore} from './useStore'

export default function Shopper() {
    return {
        TitleWrapper,
    }
}

export function TitleWrapper({
    source,
    children,
}: {
    source: Map<any, any>
    children: ReactNode
}) {
    const externalId: string = source.get('external_id')
    const store = useStore() as Map<any, any>
    if (!store) {
        return null
    }
    const storeUrl: string = store.get('url')
    const url = `${storeUrl}/wp-admin/user-edit.php?user_id=${externalId}`
    const first_name: string = source.get('first_name', '')
    const last_name: string = source.get('last_name', '')
    const titleName =
        first_name && last_name ? `${first_name} ${last_name}` : children
    return (
        <>
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="WooCommerce" />
                WooCommerce
                <CardHeaderSubtitle>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {titleName}
                    </a>
                </CardHeaderSubtitle>
            </CardHeaderTitle>
        </>
    )
}
