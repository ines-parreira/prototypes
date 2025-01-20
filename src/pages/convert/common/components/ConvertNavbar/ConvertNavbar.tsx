import classNames from 'classnames'
import React from 'react'

import navbarCss from 'assets/css/navbar.less'
import {ActiveContent, Navbar} from 'common/navigation'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'

import css from './ConvertNavbar.less'
import ConvertNavbarView from './ConvertNavbarView'

const ConvertNavbar = () => (
    <Navbar activeContent={ActiveContent.Convert} title="Convert">
        <div className={classNames(navbarCss['link-wrapper'], css.navbarItem)}>
            <NavbarLink to="/app/convert/overview" exact>
                <span>Overview</span>
            </NavbarLink>
        </div>

        <ConvertNavbarView />
    </Navbar>
)

export default ConvertNavbar
