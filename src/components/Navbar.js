import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import _ from 'lodash'

export default class Navbar extends React.Component {
    componentDidMount() {
        $('#user-menu', this.refs.navbar).dropdown({
            direction: 'upward'
        })
        $('#main-menu', this.refs.navbar).dropdown()
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
        const { views, currentUser, applyView } = this.props
        const sections = this.sections(_.values(views.get('items').toJS()))

        return (
            <div className="navbar" ref="navbar">
                <div id="main-menu" className="navbar-btn navbar-btn-category ui dropdown">
                    Tickets
                    <i className="icon angle down"/>
                    <div className="menu">
                        <Link to="/app" className="item">Dashboard</Link>
                        {/* <Link to="/rules" className="item">Rules</Link> */}
                        <Link to="/app/users" className="item">Users</Link>
                    </div>
                </div>

                <div className="navbar-content ui fluid inverted blue large vertical menu">
                    {Object.keys(sections).map((sectionId) => {
                        const section = sections[sectionId]
                        if (!section.views.length) {
                            return null
                        }
                        const counter = '' // '(0)'

                        return (
                            <div key={sectionId} className="item">
                                <h4 className="">{section.title}</h4>
                                <div className="menu">
                                    {section.views.map((view) => {
                                        let classes = 'item'

                                        if (view.slug === this.props.currentViewSlug) {
                                            classes = 'active item'
                                        }

                                        const key = `${view.slug}-${view.id}`

                                        return (
                                             <Link
                                                 key={key}
                                                 to={`/app/tickets/${view.slug}`}
                                                 className={classes}
                                                 onClick={() => { applyView(view.slug) }}
                                             >
                                                {view.name} {counter}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
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
    currentViewSlug: PropTypes.string,
    currentUser: PropTypes.object,
    applyView: PropTypes.func
}
