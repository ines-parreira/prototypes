import React, {Component, ReactElement} from 'react'
import {Navbar} from 'reactstrap'

import css from './SecondaryNavbar.less'

type NavbarProps = {
    children: ReactElement[]
}

export default class SecondaryNavbar extends Component<NavbarProps> {
    render() {
        const linkProps = {
            className: css.link,
            activeClassName: css.active,
        }

        const childrenWithProps = React.Children.map(
            this.props.children,
            (child) => React.cloneElement(child, linkProps)
        )

        return <Navbar className={css.navbar}>{childrenWithProps}</Navbar>
    }
}
