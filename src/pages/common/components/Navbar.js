import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import _ from 'lodash'

// A <Link /> with some default styles
const NavLink = (props) => (
    <Link {...props} activeClassName="active" className="item"/>
)

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
        const {currentUser} = this.props
        return (
            <div className="navbar" ref="navbar">
                <div id="main-menu" className="navbar-btn navbar-btn-category ui dropdown">
                    {this.state.title}
                    <i className="icon angle down"/>
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
                        {/**
                         <NavLink
                            to="/app/rules"
                            onClick={() => this.setState({title: 'Rules'})}
                        >
                            Rules
                        </NavLink>
                        */}
                    </div>
                </div>

                <div className="navbar-content ui fluid inverted blue large vertical menu">
                    {this.props.children}
                </div>

                <div id="user-menu" className="navbar-btn ui dropdown">
                    <i className="ellipsis horizontal icon"/>
                    <div>
                        <h4 className="current-user">
                            <i className="status green circle icon" title="User online"/>
                            <span className="name" title={currentUser.get('name')}>{currentUser.get('name')}</span>
                        </h4>
                    </div>

                    <div className="menu">
                        <Link className="item" to="/app/your-profile"><i className="user icon"/> Your profile</Link>
                        <a className="item" href="/logout"><i className="sign out icon"/> Sign Out</a>
                        {/*
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
