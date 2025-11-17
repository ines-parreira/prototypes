import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import type { NavbarLinkProps } from 'pages/common/components/navbar/NavbarLink'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'

import css from './AutomateNavbarPaywallNavbarLink.less'

type Props = {
    children: ReactNode
    isNested?: boolean
    canduId?: string
} & NavbarLinkProps

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const AutomateNavbarPaywallNavbarLink = ({
    children,
    isNested,
    canduId,
    ...props
}: Props) => {
    return (
        <div
            className={classnames(cssNavbar['link-wrapper'], {
                [cssNavbar.isNested]: isNested,
            })}
            data-candu-id={canduId}
        >
            <NavbarLink className={css.item} {...props}>
                <div className={css.name}>{children}</div>
                <i className={classnames('material-icons md-2', css.icon)}>
                    arrow_circle_up
                </i>
            </NavbarLink>
        </div>
    )
}

export default AutomateNavbarPaywallNavbarLink
