import React from 'react'
import {Link} from 'react-router'

export default class StatsNavbarView extends React.Component {
    render() {
        return (
            <div>
                <div className="item">
                    <div className="menu">
                        <Link
                            className="item"
                            to="/app/stats"
                            activeClassName="active"
                        >
                            Overview
                        </Link>
                        <Link
                            className="item"
                            to="/app/stats/tags"
                            activeClassName="active"
                        >
                            Tags
                        </Link>
                        <Link
                            className="item"
                            to="/app/stats/agents"
                            activeClassName="active"
                        >
                            Agents
                        </Link>
                        <Link
                            className="item"
                            to="/app/stats/channels"
                            activeClassName="active"
                        >
                            Channels
                        </Link>
                    </div>
                </div>
            </div>

        )
    }
}
