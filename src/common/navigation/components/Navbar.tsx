import cn from 'classnames'
import React, {useRef} from 'react'
import type {ReactNode, RefObject} from 'react'

import {useFlag} from 'common/flags'
import {NotificationsButton} from 'common/notifications'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import HomePageLink from 'pages/common/components/HomePageLink'
import SpotlightButton from 'pages/common/components/Spotlight/SpotlightButton'
import {isOpenedPanel as getIsOpenedPanel} from 'state/layout/selectors'

import useNavbarResize from '../hooks/useNavbarResize'
import MainNavigation, {ActiveContent} from './MainNavigation'
import css from './Navbar.less'
import UserMenuWithToggle from './UserMenuWithToggle'

type Props = {
    activeContent: ActiveContent
    children: ReactNode
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

    const isMobileResolution = useIsMobileResolution()
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )
    const showGlobalNav = hasGlobalNav && !isMobileResolution

    return (
        <div
            ref={navbarRef}
            className={cn(css.sidebar, {[css.isResizing]: isResizing})}
            style={disableResize ? {} : {width: `${width}px`}}
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
                <div className={css['navbar-cta-group']}>
                    {!showGlobalNav && (
                        <>
                            <HomePageLink />
                            <div data-candu-id="navbar-home-spacer" />
                            <SpotlightButton />
                            <NotificationsButton />
                        </>
                    )}
                    {headerContent}
                </div>

                <div ref={navbarContentRef} className={css['navbar-content']}>
                    {children}
                </div>

                {!showGlobalNav && (
                    <>
                        <div data-candu-id="navbar-menu-spacer" />
                        <UserMenuWithToggle />
                    </>
                )}
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
