import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import _ from 'lodash'

export default class Navbar extends React.Component {
    componentDidMount() {
        $('.ui.dropdown', this.refs.navbar).dropdown()
    }

    sections(views) {
        // Populate sections
        const ret = {
            favorites: {
                title: 'FAVORITES',
                views: []
            },
            private: {
                title: 'PRIVATE',
                views: []
            },
            shared: {
                title: 'SHARED',
                views: []
            }
        }

        if (views) {
            for (const view of views) {
                const section = view.section ? view.section : 'shared'
                ret[section].views.push(view)
            }
        }
        return ret
    }

    render() {
        const { views, currentUser } = this.props
        const sections = this.sections(_.values(views.toJS()))
        return (
            <div className="navbar" ref="navbar">
                <div className="navbar-btn navbar-btn-category ui dropdown">
                    Tickets
                    <i className="icon angle down"/>
                    <div className="menu">
                        <Link to="/" className="item">Dashboard</Link>
                        <Link to="/rules" className="item">Rules</Link>
                        <Link to="/users" className="item">Users</Link>
                    </div>
                </div>

                <div className="navbar-content ui fluid inverted blue large vertical menu">
                    {Object.keys(sections).map((sectionId) => {
                        const section = sections[sectionId]
                        if (!section.views.length) {
                            return null
                        }
                        let counter = ''
                        if (true) {
                            //counter = `(${counter})`
                            counter = '(0)'
                        }
                        return (
                            <div key={sectionId} className="item">
                                <div className="header">{section.title}</div>
                                <div className="menu">
                                    {section.views.map((view) => {
                                        return (
                                            <Link key={view.id} to={`/tickets/${view.slug}`} className="item">
                                                {view.name} {counter}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="navbar-btn ui dropdown">
                    <i className="ellipsis horizontal icon"/>
                    <div>
                        <h4>
                            <i className="green circle icon" title="User online"/>
                            {currentUser.get('name')}
                        </h4>
                    </div>

                    <div className="menu">
                        <a className="item" href="/logout"><i className="sign out icon"/> Sign Out</a>
                        <a className="item"><i className="edit icon"/> Edit Profile</a>
                        <a className="item"><i className="globe icon"/> Choose Language</a>
                        <a className="item"><i className="settings icon"/> Account Settings</a>
                    </div>
                </div>
            </div>
        )
    }
}

Navbar.propTypes = {
    views: PropTypes.object,
    currentUser: PropTypes.object
}
