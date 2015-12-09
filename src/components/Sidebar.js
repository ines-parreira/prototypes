import React, {PropTypes} from 'react'
import {Link} from 'react-router'

export default class Sidebar extends React.Component {

    sections(views) {
        // Populate sections
        let ret = {
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
        const {views, currentUser} = this.props
        const sections = this.sections(views)
        return (
            <div className="ui inverted blue left visible sidebar menu">
                <div className="ui inverted blue large vertical menu">
                    <div className="ui dropdown item">
                        Tickets
                        <i className="chevron down icon"/>
                        <div className="menu">
                            <Link to="/" className="item">Dashboard</Link>
                            <Link to="/rules" className="item">Rules</Link>
                        </div>
                    </div>
                    {Object.keys(sections).map((sectionId) => {
                        const section = sections[sectionId]
                        if (!section.views.length) {
                            return null
                        }
                        return (
                            <div key={sectionId} className="item">
                                <div className="header">{section.title}</div>
                                <div className="menu">
                                    {section.views.map((view) => {
                                        return (
                                            <Link key={view.id} to={`/tickets/${view.slug}`} className="item">
                                                {view.name}
                                                <div className="ui label">0</div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    <div className="item">
                        <div className="header">FAVORITES (9)</div>
                        <div className="menu">
                            <a className="item">My tickets (12)</a>
                            <a className="item">New tickets (102)</a>
                            <a className="item">Open tickets (22)</a>
                            <a className="item">Closed tickets</a>
                        </div>
                    </div>

                    <div className="item">
                        <div className="header">MY VIEWS</div>
                        <div className="menu">
                            <a className="item">My tickets (12)</a>
                            <a className="item">New tickets (102)</a>
                            <a className="item">Open tickets (22)</a>
                            <a className="item">Closed tickets</a>
                        </div>
                    </div>
                </div>

                <div className="ui inverted blue large vertical bottom fixed menu">
                    <div href="" className="ui top dropdown item">
                        <i className="ellipsis horizontal icon"/>
                        <div>
                            <h4>
                                <i className="green circle icon" title="User online" />
                                {currentUser.get('first_name')} {currentUser.get('last_name')}
                            </h4>
                        </div>

                        <div className="menu">
                            <a className="item"><i className="edit icon"/> Edit Profile</a>
                            <a className="item"><i className="globe icon"/> Choose Language</a>
                            <a className="item"><i className="settings icon"/> Account Settings</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

Sidebar.propTypes = {
    views: PropTypes.object,
    currentUser: PropTypes.object
}
