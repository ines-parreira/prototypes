import * as Sentry from '@sentry/react'
import classnames from 'classnames'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import PropTypes from 'prop-types'
import React, {
    Component,
    createRef,
    ReactNode,
    MouseEvent as MouseEventReact,
    TouchEvent as TouchEventReact,
    RefObject,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {ActiveContent, MainNavigation, NavbarLink} from 'common/navigation'
import {NotificationsButton} from 'common/notifications'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import HomePageLink from 'pages/common/components/HomePageLink'
import SpotlightButton from 'pages/common/components/Spotlight/SpotlightButton'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from 'services/activityTracker'
import {tryLocalStorage} from 'services/common/utils'
import shortcutManager from 'services/shortcutManager/index'
import {getCurrentHelpdeskPlan} from 'state/billing/selectors'
import {isTrialing} from 'state/currentAccount/selectors'
import {submitSetting} from 'state/currentUser/actions'
import {
    getCurrentUser,
    getPreferences,
    isAvailable,
    isLoading,
} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'
import {isOpenedPanel} from 'state/layout/selectors'
import {RootState} from 'state/types'
import {THEME_CONFIGS, withTheme} from 'theme'
import type {HelpdeskThemeName, WithThemeProps} from 'theme'

import {isTouchEvent} from 'utils'
import {reportError} from 'utils/errors'

import Avatar from './Avatar/Avatar'
import CreateTicketNavbarButton from './CreateTicket/CreateTicketNavbarButton'
import DropdownBody from './dropdown/DropdownBody'
import DropdownHeader from './dropdown/DropdownHeader'
import DropdownItemLabel from './dropdown/DropdownItemLabel'
import css from './Navbar.less'
import PlaceCallNavbarButton from './PlaceCallNavbarButton'
import Screen from './screens/Screen'
import Screens from './screens/Screens'

const unreadCountChangedEvent = 'widget:publication:unread_count:changed'

const MIN_WIDTH = 200
const MAX_WIDTH = 350

type OwnProps = {
    activeContent: ActiveContent
    children: ReactNode
    disableResize?: boolean
    navbarContentRef?: RefObject<HTMLDivElement>
    splitTicketViewToggle?: ReactNode
    flags?: LDFlagSet
}

type Props = OwnProps & ConnectedProps<typeof connector> & WithThemeProps

type ActiveScreen = 'main' | 'gorgias-updates' | 'learn' | 'theme'

type State = {
    bottomDropdownOpen: boolean
    noticeableWidgetRendered: boolean
    activeScreen: ActiveScreen
    noticeableCount: number
    isResizing: boolean
    navbarWidth: number
}

export class Navbar extends Component<Props, State> {
    menuToggleRef = createRef<HTMLButtonElement>()
    navbarRef = createRef<HTMLDivElement>()

    static childContextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    state = {
        bottomDropdownOpen: false,
        noticeableWidgetRendered: false,
        activeScreen: 'main' as ActiveScreen,
        noticeableCount: 0,
        isResizing: false,
        navbarWidth: 238,
    }

    getChildContext() {
        return {
            closePanel: this._closePanel,
        }
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

    componentDidUpdate() {
        // render and update the noticeable widget and notification
        if (
            this.state.bottomDropdownOpen &&
            this.state.activeScreen === 'gorgias-updates'
        ) {
            if (this.state.noticeableWidgetRendered) {
                return
            }

            try {
                void window.noticeable
                    .render('widget', window.noticeableWidgetId)
                    .then(() => {
                        this.setState({noticeableWidgetRendered: true})
                        Sentry.addBreadcrumb({
                            category: 'noticeable',
                            message: 'widget rendered',
                        })
                    })
                    .catch((error: Error) => {
                        // https://linear.app/gorgias/issue/COR-1285/error-error-while-retrieving-publication-data-for-project
                        reportError(error)
                    })
            } catch (error) {
                // https://linear.app/gorgias/issue/COR-1272/typeerror-windownoticeablerenderthen-is-not-a-function
                reportError(error)
            }

            window.noticeable.on(
                unreadCountChangedEvent,
                window.noticeableWidgetId,
                (e: Record<string, any>) => {
                    this.setState({
                        noticeableCount: (e.detail as Record<string, any>)
                            .value,
                    })
                    Sentry.addBreadcrumb({
                        category: 'noticeable',
                        message: 'widget unread_count changed',
                    })
                }
            )
        } else if (this.state.noticeableWidgetRendered) {
            void window.noticeable
                .destroy('widget', window.noticeableWidgetId)
                .then(() => {
                    this.setState({noticeableWidgetRendered: false})
                    Sentry.addBreadcrumb({
                        category: 'noticeable',
                        message: 'widget destroyed',
                    })
                })
        }
    }

    _closePanel = () => {
        return this.props.closePanels()
    }

    _toggleBottomDropdown = () => {
        this.setState((prevState) => ({
            bottomDropdownOpen: !prevState.bottomDropdownOpen,
            activeScreen: 'main',
        }))
    }

    _updateAvailableForChatPreference = () => {
        const {currentUserPreferences, submitSetting} = this.props
        const newPreferences = currentUserPreferences.updateIn(
            ['data', 'available'],
            (status) => !status
        )
        logEvent(SegmentEvent.MenuUserLinkClicked, {link: 'available-on-off'})
        return submitSetting(newPreferences.toJS(), false)
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

    updateTheme = (name: string) => {
        this.props.setTheme(name as HelpdeskThemeName)
        logEvent(SegmentEvent.ThemeUpdate, {
            theme: name,
        })
    }

    render() {
        const {
            activeContent,
            available,
            currentHelpdeskProduct,
            currentUser,
            disableResize,
            isTrialing,
            isPreferencesLoading,
            navbarContentRef,
            flags,
            splitTicketViewToggle,
            theme,
        } = this.props
        const {isResizing, navbarWidth} = this.state
        const isPro = currentHelpdeskProduct?.name.toLowerCase() === 'pro'

        const hasOfficeHours = !!flags?.[FeatureFlagKey.OfficeHours]

        const selectedTheme = THEME_CONFIGS.find(
            ({name}) => name === theme.name
        )!

        return (
            <div
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
                        <MainNavigation activeContent={activeContent} />
                        {splitTicketViewToggle}
                    </div>
                    <div className={css['navbar-cta-group']}>
                        <HomePageLink />

                        <div data-candu-id="navbar-home-spacer" />

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

                    <button
                        ref={this.menuToggleRef}
                        className={classnames(
                            css['dropdown-toggle'],
                            css['dropdown-toggle-dropup'],
                            {[css.active]: this.state.bottomDropdownOpen}
                        )}
                        onClick={this._toggleBottomDropdown}
                        data-candu-id="navbar-user-menu"
                    >
                        <div>
                            {currentUser.get('name') ||
                                currentUser.get('email')}
                        </div>
                        <Avatar
                            name={
                                currentUser.get('name') ||
                                currentUser.get('email')
                            }
                            url={currentUser.getIn([
                                'meta',
                                'profile_picture_url',
                            ])}
                            size={36}
                            badgeColor={available ? '#24d69d' : '#FF9600'}
                        />
                    </button>
                    <Dropdown
                        className={css.menuContent}
                        isOpen={this.state.bottomDropdownOpen}
                        onToggle={this._toggleBottomDropdown}
                        target={this.menuToggleRef}
                        placement="top-start"
                        offset={0}
                    >
                        <Screens activeScreen={this.state.activeScreen}>
                            <Screen name="main">
                                <div
                                    className={classnames(
                                        css['dropdown-item-user-menu'],
                                        css.availabilityToggle
                                    )}
                                    onClick={
                                        this._updateAvailableForChatPreference
                                    }
                                >
                                    <span>Available</span>
                                    <ToggleInput
                                        isToggled={available}
                                        isLoading={isPreferencesLoading}
                                    />
                                </div>
                                <hr className={css.separator} />
                                <div
                                    onClick={() => {
                                        this.setState({
                                            activeScreen: 'theme',
                                        })
                                    }}
                                    className={classnames(
                                        css['dropdown-item-user-menu'],
                                        css.wrapper
                                    )}
                                >
                                    <DropdownItemLabel
                                        className={css.submenu}
                                        suffix={
                                            <i
                                                className={classnames(
                                                    'material-icons',
                                                    css['sub-menu-chevron']
                                                )}
                                            >
                                                chevron_right
                                            </i>
                                        }
                                    >
                                        <span className={css.label}>
                                            Theme:
                                        </span>
                                        <span className={css.value}>
                                            {selectedTheme?.settingsLabel ||
                                                selectedTheme?.label}
                                        </span>
                                    </DropdownItemLabel>
                                </div>
                                <hr className={css.separator} />
                                <DropdownBody>
                                    <NavbarLink
                                        to="/app/settings/profile"
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'your-profile',
                                                }
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                        >
                                            person
                                        </i>
                                        Your profile
                                    </NavbarLink>
                                    <div
                                        onClick={() => {
                                            this.setState({
                                                activeScreen: 'gorgias-updates',
                                            })
                                        }}
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                    >
                                        <DropdownItemLabel
                                            className={css.submenu}
                                            suffix={
                                                <i
                                                    className={classnames(
                                                        'material-icons',
                                                        css['sub-menu-chevron']
                                                    )}
                                                >
                                                    chevron_right
                                                </i>
                                            }
                                        >
                                            <i
                                                className={classnames(
                                                    'material-icons mr-2',
                                                    css.icon
                                                )}
                                            >
                                                update
                                            </i>
                                            Gorgias updates
                                        </DropdownItemLabel>
                                    </div>
                                    <div
                                        className={classnames(
                                            css['dropdown-item-user-menu']
                                        )}
                                        onClick={() => {
                                            this.setState({
                                                activeScreen: 'learn',
                                            })
                                        }}
                                    >
                                        <DropdownItemLabel
                                            className={css.submenu}
                                            suffix={
                                                <i
                                                    className={classnames(
                                                        'material-icons',
                                                        css['sub-menu-chevron']
                                                    )}
                                                >
                                                    chevron_right
                                                </i>
                                            }
                                        >
                                            <i
                                                className={classnames(
                                                    'material-icons mr-2',
                                                    css.icon
                                                )}
                                            >
                                                local_library
                                            </i>
                                            Learn
                                        </DropdownItemLabel>
                                    </div>
                                    {isPro && !isTrialing && hasOfficeHours && (
                                        <a
                                            className={classnames(
                                                css['dropdown-item-user-menu']
                                            )}
                                            onClick={() => {
                                                logEvent(
                                                    SegmentEvent.MenuUserLinkClicked,
                                                    {
                                                        link: 'office-hours',
                                                    }
                                                )
                                                window.open(
                                                    'https://calendly.com/gorgias-office-hours?utm_source=helpdesk&utm_medium=in_product&utm_campaign=user_menu',
                                                    '_blank',
                                                    'noopener'
                                                )
                                                this._toggleBottomDropdown()
                                            }}
                                        >
                                            <span title="Book a meeting with a Customer Success Manager at Gorgias.">
                                                <i
                                                    className={classnames(
                                                        'material-icons mr-2',
                                                        css.icon
                                                    )}
                                                >
                                                    event
                                                </i>
                                                Book office hours
                                            </span>
                                        </a>
                                    )}
                                    <NavbarLink
                                        to="/app/referral-program"
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'referral-program',
                                                }
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                        >
                                            favorite_border
                                        </i>
                                        Refer a friend & earn
                                    </NavbarLink>

                                    <div
                                        className={classnames(
                                            css['dropdown-item-user-menu']
                                        )}
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'log-out',
                                                }
                                            )
                                            logActivityEvent(
                                                ActivityEvents.UserClosedApp
                                            )
                                            void unregisterAppActivityTrackerHooks()
                                            void clearActivityTrackerSession()
                                            window.location.href = `/logout?csrf-token=${window.CSRF_TOKEN}`
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                        >
                                            exit_to_app
                                        </i>
                                        Log out
                                    </div>
                                </DropdownBody>
                            </Screen>

                            <Screen name="learn">
                                <DropdownHeader
                                    onClick={() => {
                                        this.setState({
                                            activeScreen: 'main',
                                        })
                                    }}
                                    className={css['dropdown-item']}
                                >
                                    <i
                                        className={classnames(
                                            'material-icons mr-2',
                                            css.icon
                                        )}
                                    >
                                        arrow_back
                                    </i>
                                    Back
                                </DropdownHeader>
                                <DropdownBody>
                                    <div
                                        className={classnames(
                                            css['dropdown-item-user-menu']
                                        )}
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'helpdocs',
                                                }
                                            )
                                            window.open(
                                                'https://docs.gorgias.com/',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                            title="Help Center"
                                        >
                                            help
                                        </i>
                                        Help Center
                                    </div>
                                    <div
                                        className={classnames(
                                            css['dropdown-item-user-menu']
                                        )}
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'gorgiaswebinars',
                                                }
                                            )
                                            window.open(
                                                'https://app.getcontrast.io/gorgias?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons-outlined mr-2',
                                                css.icon
                                            )}
                                            title="Gorgias Webinars"
                                        >
                                            subscriptions
                                        </i>
                                        Gorgias Webinars
                                    </div>
                                    <div
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'gorgiasacademy',
                                                }
                                            )
                                            window.open(
                                                'https://academy.gorgias.com/trainings?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                            title="Gorgias Academy"
                                        >
                                            school
                                        </i>
                                        Gorgias Academy
                                    </div>
                                    <div
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'gorgiascommunity',
                                                }
                                            )
                                            window.open(
                                                'https://community.gorgias.com/',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                            title="Gorgias Community"
                                        >
                                            people_alt
                                        </i>
                                        Gorgias Community
                                    </div>
                                    <div
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                        onClick={() => {
                                            shortcutManager.triggerAction(
                                                'KeyboardHelp',
                                                'SHOW_HELP'
                                            )
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'keyboard-shortcuts',
                                                }
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                        >
                                            keyboard
                                        </i>
                                        Keyboard shortcuts
                                    </div>
                                </DropdownBody>
                            </Screen>

                            <Screen name="gorgias-updates">
                                <DropdownHeader
                                    onClick={() => {
                                        this.setState({
                                            activeScreen: 'main',
                                        })
                                    }}
                                    className={css['dropdown-item']}
                                >
                                    <i
                                        className={classnames(
                                            'material-icons mr-2',
                                            css.icon
                                        )}
                                    >
                                        arrow_back
                                    </i>
                                    Back
                                </DropdownHeader>
                                <DropdownBody>
                                    <div
                                        className={classnames(
                                            css['dropdown-item-user-menu'],
                                            css.justify
                                        )}
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'latest-updates',
                                                }
                                            )
                                            window.noticeable.do(
                                                'widget:open',
                                                window.noticeableWidgetId
                                            )
                                        }}
                                    >
                                        <div>
                                            <i
                                                className={classnames(
                                                    'material-icons mr-2',
                                                    css.icon
                                                )}
                                            >
                                                new_releases
                                            </i>
                                            Latest updates
                                        </div>
                                        <span
                                            id="noticeable-widget-notification"
                                            style={{
                                                visibility: !!this.state
                                                    .noticeableCount
                                                    ? 'visible'
                                                    : 'hidden',
                                            }}
                                        />
                                    </div>
                                    <div
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'roadmap',
                                                }
                                            )
                                            window.open(
                                                'https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/tabs/3-planned/',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                        >
                                            map
                                        </i>
                                        Roadmap
                                    </div>
                                    <div
                                        className={
                                            css['dropdown-item-user-menu']
                                        }
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.MenuUserLinkClicked,
                                                {
                                                    link: 'service-status',
                                                }
                                            )
                                            window.open(
                                                'https://status.gorgias.com/',
                                                '_blank',
                                                'noopener'
                                            )
                                            this._toggleBottomDropdown()
                                        }}
                                    >
                                        <i
                                            className={classnames(
                                                'material-icons mr-2',
                                                css.icon
                                            )}
                                            title="Service status"
                                        >
                                            query_stats
                                        </i>
                                        Service status
                                    </div>
                                </DropdownBody>
                            </Screen>

                            <Screen name="theme">
                                <DropdownHeader
                                    onClick={() => {
                                        this.setState({
                                            activeScreen: 'main',
                                        })
                                    }}
                                    className={css['dropdown-item']}
                                >
                                    <i
                                        className={classnames(
                                            'material-icons mr-2',
                                            css.icon
                                        )}
                                    >
                                        arrow_back
                                    </i>
                                    Back
                                </DropdownHeader>
                                <DropdownBody>
                                    {THEME_CONFIGS.map(({label, name}) => (
                                        <div
                                            key={name}
                                            className={classnames(
                                                css['dropdown-item-user-menu'],
                                                css.justify
                                            )}
                                            onClick={() =>
                                                this.updateTheme(name)
                                            }
                                        >
                                            {label}
                                            {theme.name === name && (
                                                <span
                                                    className={classnames(
                                                        css.check,
                                                        'material-icons'
                                                    )}
                                                >
                                                    done
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </DropdownBody>
                            </Screen>
                            <div id="noticeable-widget" />
                        </Screens>
                    </Dropdown>
                </div>
                {!disableResize && (
                    <div
                        className={classnames(css['sidebar-resizer'], {
                            [css.isTouched]: isResizing,
                        })}
                        style={{left: `${navbarWidth}px`}}
                        onMouseDown={this.startResizing}
                        onTouchMove={this.startResizing}
                    />
                )}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        const getIsPreferencesLoading = isLoading(['settings', 'preferences'])

        return {
            currentHelpdeskProduct: getCurrentHelpdeskPlan(state),
            currentUser: getCurrentUser(state),
            currentUserPreferences: getPreferences(state),
            available: isAvailable(state),
            isOpenedPanel: isOpenedPanel('navbar')(state),
            isTrialing: isTrialing(state),
            isPreferencesLoading: getIsPreferencesLoading(state),
        }
    },
    {
        submitSetting,
        closePanels,
    }
)

export default connector(withTheme(withLDConsumer()(Navbar)))
