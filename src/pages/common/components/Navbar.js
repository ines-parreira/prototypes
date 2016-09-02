import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import _ from 'lodash'

export default class Navbar extends React.Component {
    componentWillMount() {
        this.state = {
            title: _.capitalize(this.props.activeContent)
        }
    }

    componentDidMount() {
        $('#user-menu', this.refs.navbar).dropdown({
            direction: 'upward'
        })
        $('#main-menu', this.refs.navbar).dropdown()
    }

    render() {
        const {currentUser, activeContent} = this.props

        const ticketsClassNames = classnames('item', {
            active: activeContent === 'tickets'
        })

        const usersClassNames = classnames('item', {
            active: activeContent === 'users'
        })

        const integrationsClassNames = classnames('item', {
            active: activeContent === 'integrations'
        })

        return (
            <div className="navbar" ref="navbar">
                <div id="main-menu" className="navbar-btn navbar-btn-category ui dropdown">
                    {this.state.title}
                    <i className="icon angle down" />
                    <div className="menu">
                        <Link to="/app" className={ticketsClassNames} onClick={() => this.setState({title: 'Tickets'})}>Tickets</Link>
                        {/* <Link to="/rules" className="item" onClick={() => this.setState({title: 'Rules'})}>Rules</Link> */}
                        <Link to="/app/users" className={usersClassNames}
                              onClick={() => this.setState({title: 'Users'})}
                        >
                            Users
                        </Link>
                        <Link to="/app/integrations" className={integrationsClassNames}
                              onClick={() => this.setState({title: 'Integrations'})}
                        >
                            Integrations
                        </Link>
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
                        <a className="item" href="/logout"><i className="sign out icon" /> Sign Out</a>
                        {/*
                         <a className="disabled item"><i className="edit icon"/> Edit Profile</a>
                         <a className="disabled item"><i className="globe icon"/> Choose Language</a>
                         <a className="disabled item"><i className="settings icon"/> Account Settings</a
                         */}
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
