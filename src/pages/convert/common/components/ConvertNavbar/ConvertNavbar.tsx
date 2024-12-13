import classNames from 'classnames'
import React from 'react'

import navbarCss from 'assets/css/navbar.less'
import {ActiveContent} from 'common/navigation'
import Navbar from 'pages/common/components/Navbar'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'

import {useIsOverviewPageEnabled} from '../../hooks/useIsOverviewPageEnabled'
import css from './ConvertNavbar.less'
import ConvertNavbarView from './ConvertNavbarView'

const ConvertNavbar = () => {
    const isOverviewPageEnabled = useIsOverviewPageEnabled()

    return (
        <Navbar activeContent={ActiveContent.Convert} title="Convert">
            {isOverviewPageEnabled && (
                <div
                    className={classNames(
                        navbarCss['link-wrapper'],
                        css.navbarItem
                    )}
                >
                    <NavbarLink to="/app/convert/overview" exact>
                        <span>Overview</span>
                    </NavbarLink>
                </div>
            )}

            <ConvertNavbarView />
        </Navbar>
    )
}

export default ConvertNavbar
