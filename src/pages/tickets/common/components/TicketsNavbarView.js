import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {compactInteger} from '../../../../utils'

export default class TicketsNavbarView extends React.Component {
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

        if (!views.isEmpty()) {
            views.forEach((v) => {
                const section = v.get('section') ? v.get('section') : 'shared'
                ret[section].views.push(v)
            })
        }
        return ret
    }

    render() {
        const {views, currentView, setViewActive, fetchTickets} = this.props
        const sections = this.sections(views.get('items'))

        return (
            <div>
                {Object.keys(sections).map((sectionId) => {
                    const section = sections[sectionId]
                    if (!section.views.length) {
                        return null
                    }


                    return (
                        <div key={sectionId} className="item">
                            <h4 className="">{section.title}</h4>
                            <div className="menu">
                                {section.views.map((v) => {
                                    const view = v.toJS()
                                    let classes = 'item'

                                    if (currentView && view.id === currentView.get('id')) {
                                        classes = 'active item'
                                    }

                                    const key = `${view.slug}-${view.id}`
                                    const count = view.count !== undefined && view.count !== null ? view.count : '?'

                                    return (
                                        <Link key={key}
                                              to={`/app/tickets/${view.id}/${view.slug}`}
                                              className={classes}
                                              onClick={() => {
                                                  setViewActive(v)
                                                  fetchTickets(views, 1)
                                              }}
                                        >
                                            {view.name} ({compactInteger(count)})
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

        )
    }
}

TicketsNavbarView.propTypes = {
    views: PropTypes.object,
    currentView: PropTypes.object,
    setViewActive: PropTypes.func,
    fetchTickets: PropTypes.func
}
