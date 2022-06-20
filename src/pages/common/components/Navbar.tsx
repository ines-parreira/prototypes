import React, {Component, ReactNode} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import * as Sentry from '@sentry/react'

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

type NavLinkProps = {
    to: string
    className: Maybe<string>
}

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
                className={classnames(className, 'dropdown-item', {
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

type State = {
    bottomDropdownOpen: boolean
    noticeableWidgetRendered: boolean
    title: Maybe<string>
}

export class Navbar extends React.Component<Props, State> {
    static childContextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    state = {
        bottomDropdownOpen: false,
        noticeableWidgetRendered: false,
        title: null,
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

    componentDidUpdate(prevProps: OwnProps, prevState: State) {
        // render and update the noticeable widget and notification
        if (this.state.bottomDropdownOpen) {
            if (
                prevState.bottomDropdownOpen ||
                this.state.noticeableWidgetRendered
            ) {
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
                'widget:publication:unread_count:changed',
                window.noticeableWidgetId,
                (e: Record<string, any>) => {
                    const element = document.getElementById(
                        'noticeable-widget-notification'
                    )
                    if (element) {
                        element.style.visibility =
                            (e.detail as Record<string, any>).value === 0
                                ? 'hidden'
                                : 'visible'
                    }
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

                <Dropdown
                    toggle={this._toggleBottomDropdown}
                    isOpen={this.state.bottomDropdownOpen}
                    className={css['nav-dropdown']}
                >
                    <DropdownToggle
                        color="transparent"
                        className={classnames(
                            css['dropdown-toggle'],
                            css['dropdown-toggle-dropup']
                        )}
                    >
                        <div>
                            <span className="body-semibold">
                                {currentUser.get('name') ||
                                    currentUser.get('email')}
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
                                    style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '18px',
                                    }}
                                    badgeColor={
                                        available ? '#24d69d' : '#FF9600'
                                    }
                                />
                            </span>
                        </div>
                    </DropdownToggle>
                    <DropdownMenu className={css['dropdown-menu']}>
                        <DropdownItem
                            tag="a"
                            toggle={false}
                            className={css['dropdown-item']}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>Available</div>
                                <div>
                                    <ToggleInput
                                        isToggled={available}
                                        isLoading={isPreferencesLoading}
                                        onClick={
                                            this
                                                ._updateAvailableForChatPreference
                                        }
                                    />
                                </div>
                            </div>
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem
                            tag={NavLink}
                            to="/app/settings/profile"
                            onClick={() => {
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'your-profile',
                                })
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
                                person
                            </i>
                            Your profile
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href="https://docs.gorgias.com/"
                            target="_blank"
                            onClick={() =>
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'helpdocs',
                                })
                            }
                            className={css['dropdown-item']}
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
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href="https://status.gorgias.com/"
                            target="_blank"
                            className={css['dropdown-item']}
                            onClick={() =>
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'service-status',
                                })
                            }
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
                        </DropdownItem>
                        {isBasicOrPro && !isTrialing && (
                            <DropdownItem
                                tag="a"
                                href="https://calendly.com/gorgias-office-hours"
                                target="_blank"
                                title="Book a meeting with a Customer Success Manager at Gorgias."
                                className={css['dropdown-item']}
                            >
                                <i
                                    className={classnames(
                                        'material-icons mr-2',
                                        css.icon
                                    )}
                                >
                                    event
                                </i>
                                Book office hours
                            </DropdownItem>
                        )}
                        <DropdownItem
                            tag="a"
                            href="https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/tabs/3-planned/"
                            target="_blank"
                            className={css['dropdown-item']}
                            onClick={() =>
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'roadmap',
                                })
                            }
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
                        </DropdownItem>
                        <DropdownItem
                            tag="div"
                            id="noticeable-widget"
                            toggle={false}
                            className={css['dropdown-item']}
                            onClick={() =>
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'latest-updates',
                                })
                            }
                        >
                            <i
                                className={classnames(
                                    'material-icons mr-2',
                                    css.icon
                                )}
                            >
                                new_releases
                            </i>
                            Latest updates
                            <span id="noticeable-widget-notification" />
                        </DropdownItem>
                        <DropdownItem
                            tag={NavLink}
                            to={'/app/referral-program'}
                            onClick={() => {
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'referral-program',
                                })
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
                                favorite_border
                            </i>
                            Refer a friend & earn
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => {
                                shortcutManager.triggerAction(
                                    'KeyboardHelp',
                                    'SHOW_HELP'
                                )
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'keyboard-shortcuts',
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
                                keyboard
                            </i>
                            Keyboard shortcuts
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href={`/logout?csrf-token=${window.CSRF_TOKEN}`}
                            className={css['dropdown-item']}
                            onClick={() =>
                                logEvent(SegmentEvent.MenuUserLinkClicked, {
                                    link: 'log-out',
                                })
                            }
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
                        </DropdownItem>
                    </DropdownMenu>
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
