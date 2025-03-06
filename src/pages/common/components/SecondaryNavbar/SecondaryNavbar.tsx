import React, { ReactNode } from 'react'

import classNames from 'classnames'
import { Navbar } from 'reactstrap'

import css from './SecondaryNavbar.less'

type Props = {
    className?: string
    children: ReactNode
}

const SecondaryNavbar = ({ className, children }: Props): JSX.Element => {
    const linkProps = {
        className: css.link,
        activeClassName: css.active,
    }

    const childrenWithProps = React.Children.map(children, (child) =>
        React.isValidElement(child)
            ? React.cloneElement(child, linkProps)
            : null,
    )

    return (
        <Navbar className={classNames(css.navbar, className)}>
            {childrenWithProps}
        </Navbar>
    )
}

export default SecondaryNavbar
