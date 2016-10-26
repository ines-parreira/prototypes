import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import {compactInteger} from '../../../../utils'

export default class TicketsNavbarView extends React.Component {
    _sections(views) {
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
                const section = v.get('section') || 'shared'
                ret[section].views.push(v)
            })
        }

        return ret
    }

    render() {
        const {views, currentView} = this.props
        const displayedViews = views
            .get('items', fromJS([]))
            .filter((view) => view.get('type') === 'ticket-list')

        const sections = this._sections(displayedViews)

        return (
            <div>
                {
                    Object.keys(sections)
                        .map((sectionId) => {
                            const section = sections[sectionId]

                            if (!section.views.length) {
                                return null
                            }

                            return (
                                <div
                                    key={sectionId}
                                    className="item"
                                >
                                    <h4>
                                        {section.title}
                                    </h4>
                                    <div className="menu">
                                        {
                                            section.views
                                                .map((v) => {
                                                    const view = v.toJS()
                                                    let classes = 'item'

                                                    if (currentView && view.id === currentView.get('id')) {
                                                        classes = 'active item'
                                                    }

                                                    const key = `${view.slug}-${view.id}`
                                                    let count = 0
                                                    if (view.count !== undefined && view.count !== null) {
                                                        count = view.count
                                                    }

                                                    return (
                                                        <Link key={key}
                                                              to={`/app/tickets/${view.id}/${view.slug}`}
                                                              className={classes}
                                                        >
                                                            {view.name} ({compactInteger(count)})
                                                        </Link>
                                                    )
                                                })
                                        }
                                    </div>
                                </div>
                            )
                        })
                }
            </div>

        )
    }
}

TicketsNavbarView.propTypes = {
    views: PropTypes.object,
    currentView: PropTypes.object
}
