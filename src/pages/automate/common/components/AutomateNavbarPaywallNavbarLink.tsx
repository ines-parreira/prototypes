import React, { ReactNode } from 'react'

import classnames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import NavbarLink, {
    NavbarLinkProps,
} from 'pages/common/components/navbar/NavbarLink'

import css from './AutomateNavbarPaywallNavbarLink.less'

type Props = {
    children: ReactNode
    isNested?: boolean
} & NavbarLinkProps

const AutomateNavbarPaywallNavbarLink = ({
    children,
    isNested,
    ...props
}: Props) => {
    return (
        <div
            className={classnames(cssNavbar['link-wrapper'], {
                [cssNavbar.isNested]: isNested,
            })}
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
