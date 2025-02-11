import cn from 'classnames'
import React, {useMemo, useRef} from 'react'
import type {ReactNode, RefObject} from 'react'

import {NotificationsButton} from 'common/notifications'

import useAppSelector from 'hooks/useAppSelector'

import HomePageLink from 'pages/common/components/HomePageLink'
import SpotlightButton from 'pages/common/components/Spotlight/SpotlightButton'
import {isOpenedPanel as getIsOpenedPanel} from 'state/layout/selectors'

import {NavBarDisplayMode} from '../hooks/useNavBar/context'
import {useNavBar} from '../hooks/useNavBar/useNavBar'
import useNavbarResize from '../hooks/useNavbarResize'
import {useDesktopOnlyShowGlobalNavFeatureFlag} from '../hooks/useShowGlobalNavFeatureFlag'
import MainNavigation, {ActiveContent} from './MainNavigation'
import css from './Navbar.less'
import UserMenuWithToggle from './UserMenuWithToggle'

type Props = {
    activeContent: ActiveContent
    children?: ReactNode
    disableResize?: boolean
    headerContent?: ReactNode
    navbarContentRef?: RefObject<HTMLDivElement>
    splitTicketViewToggle?: ReactNode
    title: string
}

export default function Navbar({
    activeContent,
    children,
    disableResize,
    headerContent,
    navbarContentRef,
    splitTicketViewToggle,
    title,
}: Props) {
    const isOpenedPanel = useAppSelector(getIsOpenedPanel('navbar'))

    const navbarRef = useRef<HTMLDivElement | null>(null)
    const {isResizing, width, onStartResize} = useNavbarResize(navbarRef)
    const {navBarDisplay} = useNavBar()

    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()

    const enableResize = useMemo(() => {
        if (disableResize) {
            return false
        }

        if (showGlobalNav) {
            return navBarDisplay === NavBarDisplayMode.Open
        }

        return true
    }, [disableResize, navBarDisplay, showGlobalNav])

    const hasHeaderContent = !showGlobalNav || !!headerContent

    return (
        <div
            ref={navbarRef}
            className={cn(css.sidebar, {[css.isResizing]: isResizing})}
            {...(enableResize && {style: {width: `${width}px`}})}
        >
            <div
                className={cn(css['nav-primary'], {
                    [css['hidden-panel']]: !isOpenedPanel,
                })}
            >
                <div className={css['nav-dropdown-wrapper']}>
                    {showGlobalNav ? (
                        <div className={css.title}>{title}</div>
                    ) : (
                        <MainNavigation activeContent={activeContent} />
                    )}
                    {splitTicketViewToggle}
                </div>
                {hasHeaderContent && (
                    <div className={css['navbar-cta-group']}>
                        {!showGlobalNav && (
                            <>
                                <HomePageLink />
                                <SpotlightButton />
                                <NotificationsButton />
                            </>
                        )}
                        {headerContent}
                    </div>
                )}

                <div
                    ref={navbarContentRef}
                    className={cn(css['navbar-content'], {
                        [css.noHeader]: !hasHeaderContent,
                    })}
                >
                    {children}
                </div>

                <div data-candu-id="navbar-menu-spacer" />
                {!showGlobalNav && <UserMenuWithToggle />}
            </div>
            {!disableResize && (
                <div
                    className={cn(css['sidebar-resizer'], {
                        [css.isTouched]: isResizing,
                    })}
                    onMouseDown={onStartResize}
                    onTouchMove={onStartResize}
                />
            )}
        </div>
    )
}
