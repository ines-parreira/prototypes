import React, {Component, ComponentProps, createRef, ReactNode} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import * as Sentry from '@sentry/react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import HomePageLink from 'pages/common/components/HomePageLink'
import shortcutManager from '../../../services/shortcutManager/index'
import {DEPRECATED_getCurrentPlan} from '../../../state/billing/selectors'
import {isTrialing} from '../../../state/currentAccount/selectors'
import {submitSetting} from '../../../state/currentUser/actions'
import {
    getCurrentUser,
    getPreferences,
    isAvailable,
    isLoading,
} from '../../../state/currentUser/selectors'
import {closePanels} from '../../../state/layout/actions'
import {isOpenedPanel} from '../../../state/layout/selectors'
import {RootState} from '../../../state/types'
import {logEvent, SegmentEvent} from '../../../store/middlewares/segmentTracker'
import {reportError} from '../../../utils/errors'

import ToggleInput from '../forms/ToggleInput'
import Avatar from './Avatar/Avatar'

import css from './Navbar.less'
import DropdownBody from './dropdown/DropdownBody'
import DropdownHeader from './dropdown/DropdownHeader'
import DropdownItemLabel from './dropdown/DropdownItemLabel'
import Screens from './screens/Screens'
import Screen from './screens/Screen'

const unreadCountChangedEvent = 'widget:publication:unread_count:changed'

type NavLinkProps = {
    to: string
    className?: string
} & ComponentProps<typeof Link>

// A <Link /> with some default styles
class NavLink extends Component<NavLinkProps> {
    render() {
        const {className, to} = this.props

        let url = to || ''

        // if the url ends with an "s", then we also count the urls without an "s"
        // ex: we highlight "Tickets" when we are on /app/tickets/something or /app/ticket/something
        if (url.endsWith('s')) {
            url = url.slice(0, -1)
        }

        return (
            <Link
                {...this.props}
                className={classnames(className, css['menu-item'], {
                    current: window.location.pathname.includes(url),
                })}
            />
        )
    }
}

const mainMenu = [
    {
        url: '/app/tickets',
        label: 'Tickets',
        icon: 'question_answer',
        segmentProp: {link: 'tickets'},
    },
    {
        url: '/app/customers',
        label: 'Customers',
        icon: 'people',
        segmentProp: {link: 'customers'},
    },
    {
        url: '/app/stats',
        label: 'Statistics',
        className: 'd-none d-md-block',
        icon: 'bar_chart',
        segmentProp: {link: 'statistics'},
    },
    {
        url: '/app/settings',
        label: 'Settings',
        icon: 'settings',
        segmentProp: {link: 'settings'},
    },
]

type OwnProps = {
    activeContent: Maybe<string>
    children: ReactNode
}

type Props = OwnProps & ConnectedProps<typeof connector>

type ActiveScreen = 'main' | 'gorgias-updates' | 'learn'

type State = {
    bottomDropdownOpen: boolean
    noticeableWidgetRendered: boolean
    title: Maybe<string>
    activeScreen: ActiveScreen
    noticeableCount: number
}

export class Navbar extends Component<Props, State> {
    menuToggleRef = createRef<HTMLButtonElement>()

    static childContextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    state = {
        bottomDropdownOpen: false,
        noticeableWidgetRendered: false,
        title: null,
        activeScreen: 'main' as ActiveScreen,
        noticeableCount: 0,
    }

    getChildContext() {
        return {
            closePanel: this._closePanel,
        }
    }

    componentWillMount() {
        this.setState({
            title: this.props.activeContent
                ? _capitalize(this.props.activeContent)
                : null,
        })
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

    render() {
        const {
            available,
            currentPlan,
            currentUser,
            isTrialing,
            isPreferencesLoading,
        } = this.props
        const currentPlanName = (currentPlan.get('name') as string) || ''
        const isBasicOrPro = ['pro', 'basic'].some((planType) =>
            currentPlanName.toLowerCase().includes(planType)
        )

        return (
            <div
                className={classnames(css['nav-primary'], {
                    [css['hidden-panel']]: !this.props.isOpenedPanel,
                })}
            >
                <UncontrolledDropdown className={css['nav-dropdown']}>
                    <DropdownToggle
                        color="transparent"
                        className={css['dropdown-toggle']}
                    >
                        <div>
                            {this.state.title || ''}
                            <i
                                className={classnames(
                                    'material-icons',
                                    css['icon-more']
                                )}
                            >
                                more_vert
                            </i>
                        </div>
                    </DropdownToggle>

                    <HomePageLink />

                    <DropdownMenu className={css['dropdown-menu']}>
                        {mainMenu.map((item) => {
                            return (
                                <DropdownItem
                                    key={item.label}
                                    tag={NavLink}
                                    to={item.url}
                                    onClick={() => {
                                        this.setState({title: item.label})
                                        logEvent(
                                            SegmentEvent.MenuMainLinkClicked,
                                            item.segmentProp
                                        )
                                        this._closePanel()
                                    }}
                                    className={css['dropdown-item']}
                                >
                                    <i
                                        className={classnames(
                                            'material-icons mr-2',
                                            css.icon
                                        )}
                                    >
                                        {item.icon}
                                    </i>
                                    {item.label}
                                </DropdownItem>
                            )
                        })}
                    </DropdownMenu>
                </UncontrolledDropdown>

                <div className={css['navbar-content']}>
                    {this.props.children}
                </div>

                <button
                    ref={this.menuToggleRef}
                    className={classnames(
                        css['dropdown-toggle'],
                        css['dropdown-toggle-dropup'],
                        {active: this.state.bottomDropdownOpen}
                    )}
                    onClick={this._toggleBottomDropdown}
                >
                    <div>
                        {currentUser.get('name') || currentUser.get('email')}
                    </div>
                    <Avatar
                        name={
                            currentUser.get('name') || currentUser.get('email')
                        }
                        url={currentUser.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        badgeColor={available ? '#24d69d' : '#FF9600'}
                    />
                </button>
                <Dropdown
                    className={css.menuContent}
                    isOpen={this.state.bottomDropdownOpen}
                    onToggle={this._toggleBottomDropdown}
                    target={this.menuToggleRef}
                    placement="top"
                    offset={0}
                >
                    <Screens activeScreen={this.state.activeScreen}>
                        <Screen name="main">
                            <div
                                className={classnames(
                                    css['dropdown-item-user-menu'],
                                    css.availabilityToggle
                                )}
                                onClick={this._updateAvailableForChatPreference}
                            >
                                <span>Available</span>
                                <ToggleInput
                                    isToggled={available}
                                    isLoading={isPreferencesLoading}
                                />
                            </div>
                            <hr className={css.separator} />
                            <DropdownBody>
                                <NavLink
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
                                    className={css['dropdown-item-user-menu']}
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
                                </NavLink>
                                <div
                                    onClick={() => {
                                        this.setState({
                                            activeScreen: 'gorgias-updates',
                                        })
                                    }}
                                    className={css['dropdown-item-user-menu']}
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
                                {isBasicOrPro && !isTrialing && (
                                    <a
                                        className={classnames(
                                            css['dropdown-item-user-menu']
                                        )}
                                        onClick={() => {
                                            window.open(
                                                'https://calendly.com/gorgias-office-hours',
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
                                <NavLink
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
                                    className={css['dropdown-item-user-menu']}
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
                                </NavLink>

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
                                    className={css['dropdown-item-user-menu']}
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
                                    className={css['dropdown-item-user-menu']}
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
                                    className={css['dropdown-item-user-menu']}
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
                                        css['latest-updates']
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
                                    className={css['dropdown-item-user-menu']}
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
                                    className={css['dropdown-item-user-menu']}
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
                        <div id="noticeable-widget" />
                    </Screens>
                </Dropdown>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        const getIsPreferencesLoading = isLoading(['settings', 'preferences'])

        return {
            currentUser: getCurrentUser(state),
            currentUserPreferences: getPreferences(state),
            currentPlan: DEPRECATED_getCurrentPlan(state),
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

export default connector(Navbar)
