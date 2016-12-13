import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import _capitalize from 'lodash/capitalize'

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

class Navbar extends React.Component {
    componentWillMount() {
        this.state = {
            title: _capitalize(this.props.activeContent)
        }
    }

    componentDidMount() {
        $('#user-menu', this.refs.navbar).dropdown({
            direction: 'upward'
        })
        $('#main-menu', this.refs.navbar).dropdown()
    }

    render() {
        const {currentUser} = this.props

        return (
            <div className="navbar" ref="navbar">
                <div id="main-menu" className="navbar-btn navbar-btn-category ui dropdown">
                    {this.state.title}
                    <i className="icon angle down" />
                    <div className="menu">
                        <NavLink
                            to="/app/tickets"
                            onClick={() => this.setState({title: 'Tickets'})}
                        >
                            Tickets
                        </NavLink>
                        <NavLink
                            to="/app/users"
                            onClick={() => this.setState({title: 'Users'})}
                        >
                            Users
                        </NavLink>
                        <NavLink
                            to="/app/integrations"
                            onClick={() => this.setState({title: 'Integrations'})}
                        >
                            Integrations
                        </NavLink>
                        <NavLink
                            to="/app/stats"
                            onClick={() => this.setState({title: 'Statistics'})}
                        >
                            Statistics
                        </NavLink>
                        <NavLink
                            to="/app/rules"
                            onClick={() => this.setState({title: 'Rules'})}
                        >
                            Rules
                        </NavLink>
                        <NavLink to="/app/settings"
                                 onClick={() => this.setState({title: 'Settings'})}
                        >
                            Settings
                        </NavLink>
                    </div>
                </div>

                <div className="navbar-content ui fluid inverted blue large vertical menu">
                    {this.props.children}
                </div>

                <div id="user-menu" className="navbar-btn ui dropdown">
                    <i className="ellipsis horizontal icon" />
                    <div>
                        <h4 className="current-user">
                            <i className="status green circle icon" title="User online" />
                            <span className="name" title={currentUser.get('name')}>{currentUser.get('name')}</span>
                        </h4>
                    </div>

                    <div className="menu">
                        <a
                            className="item"
                            href="/logout"
                        >
                            <i className="sign out icon" />
                            Sign Out
                        </a>
                    </div>
                </div>
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

