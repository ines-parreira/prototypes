import React, {PropTypes} from 'react'
import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import classnames from 'classnames'

/**
 * Render an error message (string or array of strings), should be used through the entire app to display error messages
 * @param errors - error message to display
 * @param isWarning - if true, renders a warning instead of an error (color of the error)
 */
export default class ErrorMessage extends React.Component {
    render() {
        const {errors, isWarning, inline, className} = this.props
        const style = {}
        let hasError = false
        let formattedErrors = errors

        // if string, just display it
        if (_isString(errors) && errors) {
            hasError = true
            formattedErrors = <p>{errors}</p>
        }

        // if array, display it item by item
        if (_isArray(errors) && errors.length) {
            hasError = true
            formattedErrors = errors.map((e, i) => <li key={i}>{e}</li>)
            formattedErrors = <ul>{formattedErrors}</ul>
        }

        if (!hasError) {
            return null
        }

        if (inline) {
            style.display = 'inline-block'
        }

        return (
            <div
                style={style}
                className={classnames(className, 'ui message', {
                    negative: !isWarning,
                    warning: isWarning,
                })}
            >
                {formattedErrors}
            </div>
        )
    }
}

ErrorMessage.propTypes = {
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    isWarning: PropTypes.bool.isRequired,
    inline: PropTypes.bool,
    className: PropTypes.string
}

ErrorMessage.defaultProps = {
    isWarning: false,
}
