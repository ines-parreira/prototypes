import React, {PropTypes} from 'react'

export default class NoIntegration extends React.Component {
    render() {
        const {type, loading} = this.props

        const message = loading ?
            'Loading...' :
            `You have no active ${type} integration at the moment.`

        return loading ?
            <div className="ui active text loader">{message}</div> :
            <div>{message}</div>
    }
}

NoIntegration.propTypes = {
    type: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired
}
