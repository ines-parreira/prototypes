import React, {ReactNode} from 'react'

import logo from 'assets/img/infobar/woocommerce.svg'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'

export default function Shopper() {
    return {
        TitleWrapper,
    }
}

export function TitleWrapper({children}: {children: ReactNode}) {
    return (
        <>
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="WooCommerce" />
                WooCommerce
                <CardHeaderSubtitle>{children}</CardHeaderSubtitle>
            </CardHeaderTitle>
        </>
    )
}
