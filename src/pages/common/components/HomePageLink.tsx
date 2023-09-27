import React from 'react'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'

import navBarCss from 'assets/css/navbar.less'
import useHasCanduContent from 'hooks/useHasCanduContent'

import css from './HomePageLink.less'

const CANDU_ID = 'navbar-dropdown'

export const HomePageLink = () => {
    const {hasCanduContent, ref} = useHasCanduContent<HTMLDivElement>(CANDU_ID)

    return (
        <>
            <div
                ref={ref}
                data-candu-id={CANDU_ID}
                data-testid="candu-hidden-link"
                className={css.hiddenLink}
            />
            {hasCanduContent && (
                <NavLink
                    to="/app/home"
                    data-testid="home-page-link"
                    className={classnames(
                        css.link,
                        navBarCss.link,
                        navBarCss['category-title']
                    )}
                >
                    <span className={css.title}>
                        <i
                            className={classnames(
                                'material-icons',
                                navBarCss.icon
                            )}
                        >
                            home
                        </i>
                        Home
                    </span>
                </NavLink>
            )}
        </>
    )
}

export default HomePageLink
