import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import shortcutManager from '../../../services/shortcutManager'

import * as currentUserActions from '../../../state/currentUser/actions'
import * as layoutActions from '../../../state/layout/actions'

import * as layoutSelectors from '../../../state/layout/selectors'
import * as currentUserSelectors from '../../../state/currentUser/selectors'

import ToggleButton from '../../../pages/common/components/ToggleButton'
import './Navbar.less'
import Avatar from './Avatar/Avatar'

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
    url: '/app/stats',
    label: 'Statistics',
    className: 'd-none d-md-block',
}, {
    url: '/app/settings',
    label: 'Settings',
}]

@connect((state) => ({
    currentUser: currentUserSelectors.getCurrentUser(state),
    currentUserPreferences: currentUserSelectors.getPreferences(state),
    availableForChat: currentUserSelectors.isAvailableForChat(state),
    isOpenedPanel: layoutSelectors.isOpenedPanel('navbar')(state),
}), {
    submitSetting: currentUserActions.submitSetting,
    closePanels: layoutActions.closePanels,
})
export default class Navbar extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        currentUserPreferences: PropTypes.object.isRequired,
        availableForChat: PropTypes.bool.isRequired,
        activeContent: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
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
        return submitSetting(newPreferences.toJS())
    }

    render() {
        const {currentUser, availableForChat} = this.props

        return (
            <div
                className={classnames('nav-primary navbar-panel', {
                    'hidden-panel': !this.props.isOpenedPanel,
                })}
            >
                <UncontrolledDropdown
                    className="nav-dropdown"
                >
                    <DropdownToggle color="transparent">
                        <div>
                            {this.state.title}
                            <i className="material-icons md-2">
                                more_vert
                            </i>
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

                <div className="navbar-content">
                    {this.props.children}
                </div>

                <UncontrolledDropdown
                    className="nav-dropdown dropup"
                >
                    <DropdownToggle color="transparent" style={{overflow: 'hidden'}}>
                        <div>
                            <span>
                                {currentUser.get('name')}
                                <Avatar
                                    name={currentUser.get('name')}
                                    email={currentUser.get('email')}
                                    url={currentUser.getIn(['meta', 'profile_picture_url'])}
                                    size={36}
                                    style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '18px',
                                    }}
                                    badgeColor={availableForChat ? '#24d69d' : '#FF9600'}
                                />
                            </span>
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem tag="a"
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
                                    />
                                </div>
                            </div>
                        </DropdownItem>
                        <DropdownItem divider/>
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
                            href="http://docs.gorgias.io/"
                            target="_blank"
                        >
                            <i className="material-icons mr-2">help</i>
                            Documentation
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            onClick={() => {
                                shortcutManager.triggerAction('KeyboardHelp', 'SHOW_HELP')
                            }}
                        >
                            <i className="material-icons mr-2">keyboard</i>
                            Keyboard shortcuts
                        </DropdownItem>
                        <DropdownItem
                            tag="a"
                            href="/logout"
                        >
                            <i className="material-icons mr-2">exit_to_app</i>
                            Log out
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        )
    }
}
