import React, { PropTypes } from 'react'
import _ from 'lodash'

export default class Sidebar extends React.Component {
    render() {
        const { widgets, ticket } = this.props
        return (
            <div className="ui right visible sidebar menu">
                <div className="ui large vertical menu">
                    <div className="ui dropdown item">Sidebar</div>
                </div>
            </div>
        )
    }
}

Sidebar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object
}
