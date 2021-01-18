import React from 'react'
import {NavLink} from 'react-router-dom'

import {views} from '../../../../config/stats.tsx'

export default class StatsNavbarView extends React.Component {
    render() {
        return (
            <div>
                <div className="item">
                    <div className="menu">
                        {views
                            .map((view) => {
                                return (
                                    <NavLink
                                        key={view.get('name')}
                                        className="item"
                                        to={`/app/stats/${view.get('link')}`}
                                        activeClassName="active"
                                        exact
                                    >
                                        {view.get('name')}
                                    </NavLink>
                                )
                            })
                            .valueSeq()
                            .toArray()}
                    </div>
                </div>
            </div>
        )
    }
}
