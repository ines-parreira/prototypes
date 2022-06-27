import React, {useEffect, useRef, useState} from 'react'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'

import navBarCss from 'assets/css/navbar.less'
import css from './HomePageLink.less'

export const HomePageLink = () => {
    const [hasHomePage, setHasHomePage] = useState(() => {
        const contentMap:
            | Map<Node, {root: Node; shadowChild: ShadowRoot}>
            | undefined = window.Candu?.elementCanduRootMap

        if (!contentMap) {
            return
        }

        const latestNode = Array.from(contentMap.values()).pop()

        if (!latestNode) {
            return
        }

        const homeButton = latestNode.shadowChild?.querySelector('div')
        return !!homeButton
    })

    const canduContent = useRef<HTMLDivElement>(null)
    const currentCanduContent = canduContent.current

    useEffect(() => {
        if (hasHomePage || !currentCanduContent) {
            return
        }

        const observer = new MutationObserver((mutations) => {
            const mutation = mutations[0]
            if (!mutation) {
                return
            }

            const addedNode: Node = mutation.addedNodes[0]
            if (addedNode?.nodeType !== Node.ELEMENT_NODE) {
                return
            }

            const element = addedNode as Element
            const nodeShadowRoot = element.shadowRoot
            if (nodeShadowRoot) {
                observer.observe(nodeShadowRoot, {childList: true})
            }

            if (
                element.getAttribute('data-candu-content') ===
                'Content-content-home-cta'
            ) {
                setHasHomePage(true)
            }
        })

        observer.observe(currentCanduContent, {
            childList: true,
            subtree: true,
        })

        return () => observer.disconnect()
    }, [currentCanduContent, hasHomePage])

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
                    data-testid="home-page-link"
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
