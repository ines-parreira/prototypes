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

import shortcutManager from '../../../services/shortcutManager/index'

import * as currentUserActions from '../../../state/currentUser/actions'
import * as layoutActions from '../../../state/layout/actions'

import * as layoutSelectors from '../../../state/layout/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'
import * as billingSelectors from '../../../state/billing/selectors'
import {RootState} from '../../../state/types'

import ToggleButton from '../../../pages/common/components/ToggleButton.js'
import './Navbar.less'
import * as segmentTracker from '../../../store/middlewares/segmentTracker.js'

import Avatar from './Avatar/Avatar'

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
    },
    {
        url: '/app/customers',
        label: 'Customers',
        icon: 'people',
    },
    {
        url: '/app/stats',
        label: 'Statistics',
        className: 'd-none d-md-block',
        icon: 'bar_chart',
    },
    {
        url: '/app/settings',
        label: 'Settings',
        icon: 'settings',
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

class Navbar extends React.Component<Props, State> {
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

            void window.noticeable
                .render('widget', window.noticeableWidgetId)
                .then(() => {
                    this.setState({noticeableWidgetRendered: true})
                })

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
                }
            )
        } else if (this.state.noticeableWidgetRendered) {
            void window.noticeable
                .destroy('widget', window.noticeableWidgetId)
                .then(() => {
                    this.setState({noticeableWidgetRendered: false})
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
        return submitSetting(newPreferences.toJS(), false)
    }

    render() {
        const {currentUser, currentPlan, available} = this.props
        const currentPlanName = (currentPlan.get('name') as string) || ''
        const isBasicOrPro = ['pro', 'basic'].some((planType) =>
            currentPlanName.toLowerCase().includes(planType)
        )

        return (
            <div
                className={classnames('nav-primary navbar-panel', {
                    'hidden-panel': !this.props.isOpenedPanel,
                })}
            >
                <UncontrolledDropdown className="nav-dropdown">
                    <DropdownToggle color="transparent">
                        <div>
                            {this.state.title || ''}
                            <i className="material-icons md-2">more_vert</i>
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>
                        {mainMenu.map((item) => {
                            return (
                                <DropdownItem
                                    key={item.label}
                                    tag={NavLink}
                                    to={item.url}
                                    onClick={() => {
                                        this.setState({title: item.label})
                                        this._closePanel()
                                    }}
                                >
                                    <i className="material-icons mr-2">
                                        {item.icon}
                                    </i>
                                    {item.label}
                                </DropdownItem>
                            )
                        })}
                    </DropdownMenu>
                </UncontrolledDropdown>

                <div className="navbar-content">{this.props.children}</div>

                <Dropdown
                    className="nav-dropdown dropup"
                    toggle={this._toggleBottomDropdown}
                    isOpen={this.state.bottomDropdownOpen}
                >
                    <DropdownToggle
                        color="transparent"
                        style={{overflow: 'hidden'}}
                    >
                        <div>
                            <span>
                                {currentUser.get('name')}
                                <Avatar
                                    name={currentUser.get('name')}
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
                    <DropdownMenu>
                        <DropdownItem tag="a" className="mt-2" toggle={false}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>Available</div>
                                <div>
                                    <ToggleButton
                                        value={available}
                                        onChange={
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
                                this._closePanel()
                            }}
                        >
                            <i className="material-icons mr-2">person</i>
                            Your profile
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href="https://docs.gorgias.com/"
                            target="_blank"
                            onClick={() =>
                                segmentTracker.logEvent(
                                    segmentTracker.EVENTS.HELP_CENTER_CLICKED
                                )
                            }
                        >
                            <i
                                className="material-icons mr-2"
                                title="Helpcenter"
                            >
                                help
                            </i>
                            Help center
                        </DropdownItem>
                        {isBasicOrPro && (
                            // show office hours link for basic/pro customers because they don't have a dedicated CSM
                            <DropdownItem
                                tag="a"
                                href="https://calendly.com/gorgias-office-hours"
                                target="_blank"
                                title="Book a meeting with a Customer Success Manager at Gorgias."
                            >
                                <i className="material-icons mr-2">event</i>
                                Book office hours
                            </DropdownItem>
                        )}
                        <DropdownItem
                            tag="a"
                            href="https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/tabs/3-planned/"
                            target="_blank"
                        >
                            <i className="material-icons mr-2">map</i>
                            Roadmap
                        </DropdownItem>
                        <DropdownItem
                            tag="div"
                            id="noticeable-widget"
                            toggle={false}
                        >
                            <i className="material-icons mr-2">new_releases</i>
                            Latest updates
                            <span id="noticeable-widget-notification" />
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => {
                                shortcutManager.triggerAction(
                                    'KeyboardHelp',
                                    'SHOW_HELP'
                                )
                            }}
                        >
                            <i className="material-icons mr-2">keyboard</i>
                            Keyboard shortcuts
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href={`/logout?csrf-token=${window.CSRF_TOKEN}`}
                        >
                            <i className="material-icons mr-2">exit_to_app</i>
                            Log out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentUser: currentUserSelectors.getCurrentUser(state),
        currentUserPreferences: currentUserSelectors.getPreferences(state),
        currentPlan: billingSelectors.currentPlan(state),
        available: currentUserSelectors.isAvailable(state),
        isOpenedPanel: layoutSelectors.isOpenedPanel('navbar')(state),
    }),
    {
        submitSetting: currentUserActions.submitSetting,
        closePanels: layoutActions.closePanels,
    }
)

export default connector(Navbar)
