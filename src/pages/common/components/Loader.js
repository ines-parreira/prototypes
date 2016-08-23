import React, {PropTypes} from 'react'

export const DEFAULT_MESSAGE = 'Loading...'

export const Loader = ({message, loading = true}) => {
    let content = <div className="ui active text loader">{message || DEFAULT_MESSAGE}</div>

    if (!loading) {
        content = message
    }

    return (
        <div className="loading-container">
            <div className="loading">
                {content}
            </div>
        </div>
    )
}

Loader.propTypes = {
    loading: PropTypes.bool,
    message: PropTypes.object // sometimes Object, sometimes string
}
