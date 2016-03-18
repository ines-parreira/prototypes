import React, { PropTypes } from 'react'
import _ from 'lodash'

export default class Infobar extends React.Component {
    render() {
        const { widgets, ticket } = this.props
        return (
            <div className="infobar">
                <div className="infobar-top infobar-box">
                    infobar-top
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
