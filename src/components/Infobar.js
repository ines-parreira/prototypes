import React, { PropTypes } from 'react'
import _ from 'lodash'

export default class Infobar extends React.Component {
    render() {
        const { widgets, ticket } = this.props
        return (
            <div className="infobar">
                <div className="infobar-top infobar-box">
                    <h2>
                        Erick Rodriguez
                    </h2>
                    <div className="infobar-card ui card">
                        <div className="content">
                            <ul>
                                <li>
                                    <strong>
                                        Email address:
                                    </strong>
                                    <a href="">
                                        erodriguez@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <strong>
                                        City:
                                    </strong>
                                    <a href="">
                                        NYC
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="infobar-content infobar-box">
                    infobar-content
                </div>
            </div>
        )
    }
}

Infobar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object
}
