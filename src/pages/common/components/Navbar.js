import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import './Navbar.less'

// A <Link /> with some default styles
const NavLink = (props) => {
    let url = props.to || ''

    // if the url ends with an "s", then we also count the urls without an "s"
    // ex: we highlight "Tickets" when we are on /app/tickets/something or /app/ticket/something
    if (url.endsWith('s')) {
        url = url.slice(0, -1)
    }

    const className = classnames('item', {
        active: window.location.pathname.includes(url),
    })

    return (
        <Link
            className={className}
            {...props}
        />
    )
}

NavLink.propTypes = {
    to: PropTypes.string.isRequired,
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
}, {
    url: '/app/rules',
    label: 'Rules',
}, {
    url: '/app/settings',
    label: 'Settings',
}]

class Navbar extends React.Component {
    componentWillMount() {
        this.state = {
            title: _capitalize(this.props.activeContent)
        }
    }

    render() {
        const {currentUser} = this.props

        return (
            <div className="nav-primary">
                <UncontrolledDropdown className="nav-dropdown">
                    <DropdownToggle>
                        <span style={{fontSize: '18px'}}>{this.state.title}</span>
                        <i className="fa fa-caret-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                        {
                            mainMenu.map((item) => {
                                return (
                                    <DropdownItem
                                        key={item.label}
                                        tag={NavLink}
                                        to={item.url}
                                        onClick={() => this.setState({title: item.label})}
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
                        <span>
                            <i
                                className="fa fa-circle mr-2"
                                style={{color: '#2DCF57'}}
                            />
                            {currentUser.get('name')}
                        </span>
                        <i className="fa fa-ellipsis-h" />
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem>
                            <Link to="/app/settings/profile">
                                <i className="fa fa-fw fa-user mr-2" />
                                Your profile
                            </Link>
                        </DropdownItem>
                        <DropdownItem>
                            <a href="/logout">
                                <i className="fa fa-fw fa-sign-out mr-2" />
                                Log out
                            </a>
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        )
    }
}

Navbar.propTypes = {
    currentUser: PropTypes.object.isRequired,
    activeContent: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(Navbar)

