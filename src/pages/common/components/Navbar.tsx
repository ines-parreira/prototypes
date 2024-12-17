import classnames from 'classnames'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import React, {
    Component,
    createRef,
    ReactNode,
    MouseEvent as MouseEventReact,
    TouchEvent as TouchEventReact,
    RefObject,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {
    ActiveContent,
    MainNavigation,
    UserMenuWithToggle,
} from 'common/navigation'
import {NotificationsButton} from 'common/notifications'
import {FeatureFlagKey} from 'config/featureFlags'
import withIsMobileResolution from 'hooks/useIsMobileResolution/withIsMobileResolution'
import type {WithIsMobileResolutionProps} from 'hooks/useIsMobileResolution/withIsMobileResolution'
import HomePageLink from 'pages/common/components/HomePageLink'
import SpotlightButton from 'pages/common/components/Spotlight/SpotlightButton'
import {tryLocalStorage} from 'services/common/utils'
import {isOpenedPanel} from 'state/layout/selectors'
import {RootState} from 'state/types'

import {isTouchEvent} from 'utils'

import CreateTicketNavbarButton from './CreateTicket/CreateTicketNavbarButton'
import css from './Navbar.less'
import PlaceCallNavbarButton from './PlaceCallNavbarButton'

const MIN_WIDTH = 200
const MAX_WIDTH = 350

type OwnProps = {
    activeContent: ActiveContent
    children: ReactNode
    disableResize?: boolean
    navbarContentRef?: RefObject<HTMLDivElement>
    splitTicketViewToggle?: ReactNode
    flags?: LDFlagSet
    title: string
}

type Props = OwnProps &
    ConnectedProps<typeof connector> &
    WithIsMobileResolutionProps

type State = {
    isResizing: boolean
    navbarWidth: number
}

export class Navbar extends Component<Props, State> {
    navbarRef = createRef<HTMLDivElement>()

    state = {
        isResizing: false,
        navbarWidth: 238,
    }

    UNSAFE_componentWillMount() {
        this.setState({
            navbarWidth:
                (window.localStorage.getItem(
                    'navbar-width'
                ) as unknown as number) ?? 238,
        })
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.resize)
        window.addEventListener('mouseup', this.stopResizing)
        window.addEventListener('touchmove', this.resize)
        window.addEventListener('touchend', this.stopResizing)
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.resize)
        window.removeEventListener('mouseup', this.stopResizing)
        window.removeEventListener('touchmove', this.resize)
        window.removeEventListener('touchend', this.stopResizing)
    }

    startResizing = (event: MouseEventReact | TouchEventReact) => {
        // disable resizing width for right-click event
        if (!isTouchEvent(event) && event.button === 2) {
            return
        }
        this.setState({isResizing: true})
    }

    stopResizing = () => {
        const {isResizing, navbarWidth} = this.state
        if (isResizing) {
            tryLocalStorage(() =>
                window.localStorage.setItem(
                    'navbar-width',
                    navbarWidth.toString()
                )
            )
            this.setState({isResizing: false})
        }
    }

    resize = (event: MouseEvent | TouchEvent) => {
        let navbarWidth
        if (isTouchEvent(event)) {
            const touch: Touch = event.touches[0] || event.changedTouches[0]
            navbarWidth = touch.pageX
        } else {
            navbarWidth = event.clientX
        }
        const rect = this.navbarRef.current?.getBoundingClientRect()
        if (rect) {
            navbarWidth = navbarWidth - rect.left
        }
        if (this.state.isResizing) {
            const newWidth =
                navbarWidth < MIN_WIDTH
                    ? MIN_WIDTH
                    : navbarWidth > MAX_WIDTH
                      ? MAX_WIDTH
                      : navbarWidth

            this.setState({navbarWidth: newWidth})
        }
    }

    render() {
        const {
            activeContent,
            disableResize,
            isMobileResolution,
            navbarContentRef,
            flags,
            splitTicketViewToggle,
            title,
        } = this.props
        const {isResizing, navbarWidth} = this.state

        const hasGlobalNav = !!flags?.[FeatureFlagKey.GlobalNavigation]
        const showGlobalNav = hasGlobalNav && !isMobileResolution

        return (
            <div
                ref={this.navbarRef}
                className={classnames(css.sidebar, {
                    [css.isResizing]: isResizing,
                })}
                style={disableResize ? {} : {width: `${navbarWidth}px`}}
            >
                <div
                    className={classnames(css['nav-primary'], {
                        [css['hidden-panel']]: !this.props.isOpenedPanel,
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
                            </>
                        )}

                        <SpotlightButton />
                        <NotificationsButton />
                        {activeContent === ActiveContent.Tickets ? (
                            <>
                                <CreateTicketNavbarButton
                                    isDisabled={window.location.pathname.includes(
                                        '/ticket/new'
                                    )}
                                />
                                <PlaceCallNavbarButton />
                            </>
                        ) : null}
                    </div>

                    <div
                        ref={navbarContentRef}
                        className={css['navbar-content']}
                    >
                        {this.props.children}
                    </div>

                    <div data-candu-id="navbar-menu-spacer" />
                    <UserMenuWithToggle />
                </div>
                {!disableResize && (
                    <div
                        className={classnames(css['sidebar-resizer'], {
                            [css.isTouched]: isResizing,
                        })}
                        onMouseDown={this.startResizing}
                        onTouchMove={this.startResizing}
                    />
                )}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        isOpenedPanel: isOpenedPanel('navbar')(state),
    }),
    {}
)

export default connector(withLDConsumer()(withIsMobileResolution(Navbar)))
