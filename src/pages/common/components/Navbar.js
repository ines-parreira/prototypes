import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {submitSetting} from '../../../state/currentUser/actions'
import * as layoutActions from '../../../state/layout/actions'

import * as layoutSelectors from '../../../state/layout/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'

import ToggleButton from '../../../pages/common/components/ToggleButton'
import './Navbar.less'

// A <Link /> with some default styles
const NavLink = (props) => {
    let url = props.to || ''

    // if the url ends with an "s", then we also count the urls without an "s"
    // ex: we highlight "Tickets" when we are on /app/tickets/something or /app/ticket/something
    if (url.endsWith('s')) {
        url = url.slice(0, -1)
    }

    const className = classnames(props.className, 'dropdown-item', {
        current: window.location.pathname.includes(url),
    })

    return (
        <Link
            {...props}
            className={className}
        />
    )
}

NavLink.propTypes = {
    to: PropTypes.string.isRequired,
    className: PropTypes.string,
}

const mainMenu = [{
    url: '/app/tickets',
    label: 'Tickets',
}, {
    url: '/app/users',
    label: 'Users',
}, {
    url: '/app/integrations',
    label: 'Integrations',
}, {
    url: '/app/stats',
    label: 'Statistics',
    className: 'hidden-sm-down',
}, {
    url: '/app/settings',
    label: 'Settings',
}]

@connect((state) => ({
    currentUser: currentUserSelectors.getCurrentUser(state),
    currentUserPreferences: currentUserSelectors.getPreferences(state),
    availableForChat: currentUserSelectors.getChatStatus(state),
    isOpenedPanel: layoutSelectors.isOpenedPanel('navbar')(state),
}), {
    submitSetting,
    closePanels: layoutActions.closePanels,
})
export default class Navbar extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        currentUserPreferences: PropTypes.object.isRequired,
        availableForChat: PropTypes.bool.isRequired,
        activeContent: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
        submitSetting: PropTypes.func.isRequired,
        isOpenedPanel: PropTypes.bool.isRequired,
        closePanels: PropTypes.func.isRequired,
    }

    static childContextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    getChildContext() {
        return {
            closePanel: this._closePanel,
        }
    }

    componentWillMount() {
        this.state = {
            title: _capitalize(this.props.activeContent)
        }
    }

    _closePanel = () => {
        return this.props.closePanels()
    }

    _updateShowChatPreferences = () => {
        const {currentUserPreferences, submitSetting} = this.props
        const newPreferences = currentUserPreferences.updateIn(['data', 'available_for_chat'], status => !status)
        submitSetting(newPreferences.toJS())
    }

    render() {
        const {currentUser, availableForChat} = this.props

        return (
            <div
                className={classnames('nav-primary navbar-panel', {
                    'hidden-panel': !this.props.isOpenedPanel,
                })}
            >
                <UncontrolledDropdown className="nav-dropdown">
                    <DropdownToggle>
                        <div>
                            <div style={{fontSize: '18px'}}>{this.state.title}</div>
                            <i className="fa fa-caret-down" />
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>
                        {
                            mainMenu.map((item) => {
                                return (
                                    <DropdownItem
                                        className={item.className}
                                        key={item.label}
                                        tag={NavLink}
                                        to={item.url}
                                        onClick={() => {
                                            this.setState({title: item.label})
                                            this._closePanel()
                                        }}
                                    >
                                        {item.label}
                                    </DropdownItem>
                                )
                            })
                        }
                    </DropdownMenu>
                </UncontrolledDropdown>

                <div className="navbar-content ui fluid inverted blue large vertical menu">
                    {this.props.children}
                </div>

                <UncontrolledDropdown
                    className="nav-dropdown"
                    dropup
                >
                    <DropdownToggle>
                        <div>
                            <span>
                                <i
                                    className="fa fa-circle mr-2"
                                    style={{color: availableForChat ? '#2DCF57' : '#FF9600'}}
                                />
                                {currentUser.get('name')}
                            </span>
                            <i className="fa fa-ellipsis-h" />
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            className="mt-2"
                            toggle={false}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    Available for chat
                                </div>
                                <div>
                                    <ToggleButton
                                        value={availableForChat}
                                        onChange={this._updateShowChatPreferences}
                                        inline
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
                            <i className="fa fa-fw fa-user mr-2" />
                            Your profile
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href="/logout"
                        >
                            <i className="fa fa-fw fa-sign-out mr-2" />
                            Log out
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        )
    }
}
