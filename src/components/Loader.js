import React, {PropTypes} from 'react'
import classNames from 'classnames'

export const DEFAULT_MESSAGE = 'Loading...'

export const Loader = ({message}) => {
    const className = classNames(
        'ui',
        'active',
        'text',
        'loader', {
            indeterminate: message !== DEFAULT_MESSAGE
        }
    )
    return (
        <div className="loading-container">
            <div className="loading">
                <div className={className}>{message || DEFAULT_MESSAGE}</div>
            </div>
        </div>
    )
}
Loader.propTypes = {message: PropTypes.string}
