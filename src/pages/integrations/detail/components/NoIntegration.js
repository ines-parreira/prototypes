import React, {PropTypes} from 'react'

export default class NoIntegrations extends React.Component {
    render() {
        const {type, loading} = this.props

        const message = loading ? 'Loading...' : `You have no active ${type} integration at the moment.`
        const content = loading ?
            <div className="ui active text loader" style={{position: 'relative'}}>{message}</div> : message
        return (<tr>
            <td>
                {content}
            </td>
        </tr>)
    }
}

NoIntegrations.propTypes = {
    type: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired
}
