import React from 'react'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'

import navBarCss from 'assets/css/navbar.less'

import useCandu from 'candu/useCandu'
import css from './HomePageLink.less'

export const HomePageLink = () => {
    const hasCanduContent = useCandu()

    return hasCanduContent ? (
        <NavLink
            to="/app/home"
            data-testid="home-page-link"
            data-candu-id="home-page-button"
            className={classnames(css.link, navBarCss.link)}
        >
            <span className={css.title}>
                <i className={classnames('material-icons', navBarCss.icon)}>
                    home
                </i>
                Home
            </span>
        </NavLink>
    ) : null
}

export default HomePageLink
