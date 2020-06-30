// @flow
import React, {type ChildrenArray, type Element} from 'react'
import {Navbar} from 'reactstrap'

import css from './SecondaryNavbar.less'

type NavbarProps = {
    children: ChildrenArray<Element<any>>,
}

export default class SecondaryNavbar extends React.Component<NavbarProps> {
    render() {
        const linkProps = {
            className: 'nav-link',
            activeClassName: 'disabled',
        }

        const childrenWithProps = React.Children.map(
            this.props.children,
            (child) => React.cloneElement(child, linkProps)
        )

        return <Navbar className={css.navbar}>{childrenWithProps}</Navbar>
    }
}
