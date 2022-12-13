import React from 'react'
import {NavLink, NavLinkProps} from 'react-router-dom'
import classnames from 'classnames'

import css from 'assets/css/navbar.less'

type Props = Pick<NavLinkProps, 'to' | 'exact' | 'children'> & {
    isNested?: boolean
    className?: string
}

const NavbarLink = ({isNested, className, exact = false, ...props}: Props) => {
    return (
        <NavLink
            className={classnames(
                css.link,
                {[css.isNested]: isNested},
                className
            )}
            activeClassName="active"
            isActive={(match) => {
                if (!match) {
                    return false
                }

                return !exact || match.isExact
            }}
            {...props}
        />
    )
}

export default NavbarLink
