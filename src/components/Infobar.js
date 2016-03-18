import React, { PropTypes } from 'react'
import _ from 'lodash'

export default class Infobar extends React.Component {
    render() {
        const { widgets, ticket } = this.props
        return (
            <div className="infobar">
                <div className="infobar ui large vertical menu">
                    <div className="ui dropdown item">Sidebar</div>
                </div>
            </div>
        )
    }
}

Infobar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object
}
