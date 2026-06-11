import type { ReactNode } from 'react'
import React from 'react'

import css from './PaywallViewHeader.less'

type Props = {
    logo?: string
    logoAlt?: string
    title?: ReactNode
}

export function PaywallViewHeader({ logo, logoAlt, title }: Props) {
    return (
        <>
            {logo && (
                <img className={css.icon} src={logo} alt={logoAlt ?? 'icon'} />
            )}
            {title && <div className={css.title}>{title}</div>}
        </>
    )
}
