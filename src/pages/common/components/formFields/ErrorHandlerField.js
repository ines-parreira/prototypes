import React, {PropTypes} from 'react'

/**
 * This field is only used to display errors of a property without sending data or displaying any input
 * Useful for errors display in a form at a specific name
 */
class ErrorHandlerField extends React.Component {
    static propTypes = {
        meta: PropTypes.object.isRequired,
    }

    render() {
        const {meta} = this.props

        return (
            <div className="ui field">
                {
                    meta.invalid && meta.error && (
                        <div className="ui error message"><p>{meta.error}</p></div>
                    )
                }
            </div>
        )
    }
}

export default ErrorHandlerField
