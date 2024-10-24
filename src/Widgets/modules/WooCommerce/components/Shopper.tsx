import {Map} from 'immutable'
import React, {ReactNode} from 'react'

import logo from 'assets/img/infobar/woocommerce.svg'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'
import {CardHeaderIcon} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import {CardHeaderSubtitle} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderSubtitle'
import {CardHeaderTitle} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'

import {useStore} from '../hooks/useStore'

export const shopperCustomization: CardCustomization = {
    TitleWrapper,
}

export function TitleWrapper({
    source,
    children,
}: {
    source: Map<any, any>
    children: ReactNode
}) {
    const externalId: string = source.get('external_id')
    const store = useStore()
    if (!store) {
        return null
    }
    const storeUrl = store.url
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
