import React, {ReactNode} from 'react'
import {Navbar} from 'reactstrap'

import css from './SecondaryNavbar.less'

type Props = {
    children: ReactNode
}

const SecondaryNavbar = ({children}: Props): JSX.Element => {
    const linkProps = {
        className: css.link,
        activeClassName: css.active,
    }

    const childrenWithProps = React.Children.map(children, (child) =>
        React.isValidElement(child)
            ? React.cloneElement(child, linkProps)
            : null
    )

    return <Navbar className={css.navbar}>{childrenWithProps}</Navbar>
}

export default SecondaryNavbar
