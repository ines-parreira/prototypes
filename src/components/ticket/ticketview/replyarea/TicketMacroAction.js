import React, {PropTypes} from 'react'
import _ from 'lodash'

export default class TicketMacroAction extends React.Component {
    render = () => {
        const { title, description } = this.props.action.toJS()
        return (
            <div className="ui message">
                <div className="header">
                    {title}
                </div>
                <p>{description}</p>
            </div>
        )
    }
}

TicketMacroAction.propTypes = {
    action: PropTypes.object.isRequired,
}
