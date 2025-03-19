import classNames from 'classnames'

import navbarCss from 'assets/css/navbar.less'
import { ActiveContent, Navbar } from 'common/navigation'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'

import ConvertNavbarView from './ConvertNavbarView'

import css from './ConvertNavbar.less'

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
