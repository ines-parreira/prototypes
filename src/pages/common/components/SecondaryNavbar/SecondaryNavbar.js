// @flow
import React, {type Node} from 'react'
import {Navbar} from 'reactstrap'
import css from './SecondaryNavbar.less'

type NavbarProps = {
    children: Node
}

export default class SecondaryNavbar extends React.Component<NavbarProps> {
    render() {
        return (
            <Navbar className={css.navbar}>
                {this.props.children}
            </Navbar>
        )
    }
}
