import React, {useEffect, useRef, useState} from 'react'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'

import navBarCss from 'assets/css/navbar.less'
import css from './HomePageLink.less'

export const HomePageLink = () => {
    const [hasHomePage, setHasHomePage] = useState(() => {
        const contentMap: Map<any, any> | undefined =
            window.Candu?.elementCanduRootMap
        return contentMap && contentMap.size > 0
    })
    const canduContent = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (hasHomePage || !canduContent.current) {
            return
        }
        const observer = new MutationObserver(() => setHasHomePage(true))

        observer.observe(canduContent.current, {
            childList: true,
            subtree: true,
        })

        return () => observer.disconnect()
    }, [canduContent, hasHomePage])

    return (
        <>
            <div
                ref={canduContent}
                data-candu-id="navbar-dropdown"
                data-testid="candu-hidden-link"
                className={css.hiddenLink}
            />
            {hasHomePage && (
                <NavLink
                    to="/app/home"
                    className={classnames(
                        css.link,
                        navBarCss.link,
                        navBarCss['category-title']
                    )}
                >
                    <i className={classnames('material-icons', navBarCss.icon)}>
                        home
                    </i>
                    Home
                </NavLink>
            )}
        </>
    )
}

export default HomePageLink
