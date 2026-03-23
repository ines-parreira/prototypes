import { useMemo, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import cn from 'classnames'

import { NotificationsButton } from 'common/notifications'
import { useTheme } from 'core/theme'
import useAppSelector from 'hooks/useAppSelector'
import HomePageLink from 'pages/common/components/HomePageLink'
import SpotlightButton from 'pages/common/components/Spotlight/SpotlightButton'
import { isOpenedPanel as getIsOpenedPanel } from 'state/layout/selectors'

import { NavBarDisplayMode } from '../hooks/useNavBar/context'
import { useNavBar } from '../hooks/useNavBar/useNavBar'
import useNavbarResize from '../hooks/useNavbarResize'
import { useDesktopOnlyShowGlobalNavFeatureFlag } from '../hooks/useShowGlobalNavFeatureFlag'
import type { ActiveContent } from './MainNavigation'
import MainNavigation from './MainNavigation'
import UserMenuWithToggle from './UserMenuWithToggle'

import css from './Navbar.less'

type Props = {
    activeContent: ActiveContent
    title?: string
    children?: ReactNode
    disableResize?: boolean
    headerContent?: ReactNode
    navbarContentRef?: RefObject<HTMLDivElement>
    splitTicketViewToggle?: ReactNode
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
    const theme = useTheme()
    const isOpenedPanel = useAppSelector(getIsOpenedPanel('navbar'))

    const navbarRef = useRef<HTMLDivElement | null>(null)
    const { isResizing, width, onStartResize } = useNavbarResize(navbarRef)
    const { navBarDisplay } = useNavBar()

    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const enableResize = useMemo(() => {
        if (disableResize) {
            return false
        }

        if (hasWayfindingMS1Flag) {
            return false
        }

        if (showGlobalNav) {
            return navBarDisplay === NavBarDisplayMode.Open
        }

        return true
    }, [disableResize, navBarDisplay, showGlobalNav, hasWayfindingMS1Flag])

    const hasHeaderContent = !showGlobalNav || !!headerContent

    return (
        <div
            ref={navbarRef}
            className={cn(css.sidebar, {
                [css.isResizing]: isResizing,
                [css.legacy]: !hasWayfindingMS1Flag,
                dark: theme.resolvedName === 'classic' && !hasWayfindingMS1Flag,
            })}
            {...(enableResize && { style: { width: `${width}px` } })}
        >
            <div
                className={cn(css['nav-primary'], {
                    [css['hidden-panel']]: !isOpenedPanel,
                    [css.legacy]: !hasWayfindingMS1Flag,
                })}
            >
                {!hasWayfindingMS1Flag && (
                    <div className={css['nav-dropdown-wrapper']}>
                        {showGlobalNav ? (
                            <div className={css.title}>{title}</div>
                        ) : (
                            <MainNavigation activeContent={activeContent} />
                        )}
                        {splitTicketViewToggle}
                    </div>
                )}
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
                        [css.legacy]: !hasWayfindingMS1Flag,
                        [css.noHeader]: !hasHeaderContent,
                    })}
                >
                    {children}
                </div>

                <div data-candu-id="navbar-menu-spacer" />
                {!showGlobalNav && <UserMenuWithToggle />}
            </div>
            {enableResize && (
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
