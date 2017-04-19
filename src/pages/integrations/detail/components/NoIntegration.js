import React, {PropTypes} from 'react'

export default class NoIntegration extends React.Component {
    render() {
        const {loading} = this.props

        if (loading) {
            return (
                <div className="ui active text loader">
                    Loading...
                </div>
            )
        }

        return (
            <div>
                You have no integration of this type at the moment.
            </div>
        )
    }
}

NoIntegration.propTypes = {
    type: PropTypes.string,
    loading: PropTypes.bool.isRequired
}
